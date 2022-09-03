import { AbstractService, InjectService, IOService, Utils } from "@adronix/server";
import { InjectTypeORM, TypeORM } from "@adronix/typeorm";
import { DateTime } from "luxon";
import { In, IsNull, MoreThan, Not } from "typeorm";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetComponent } from "../persistence/entities/MmsAssetComponent";
import { MmsAssetType } from "../persistence/entities/MmsAssetModel";
import { MmsCounter } from "../persistence/entities/MmsCounter";
import { MmsLastTaskInfo } from "../persistence/entities/MmsLastTaskInfo";
import { MmsScheduling } from "../persistence/entities/MmsScheduling";
import { MmsServiceProvision } from "../persistence/entities/MmsServiceProvision";
import { MmsStateAttribute } from "../persistence/entities/MmsStateAttribute";
import { MmsTask } from "../persistence/entities/MmsTask";
import { MmsTaskClosingReason } from "../persistence/entities/MmsTaskClosingReason";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";
import { MmsWorkOrder } from "../persistence/entities/MmsWorkOrder";
import { MmsWorkPlan } from "../persistence/entities/MmsWorkPlan";

function toDateTime(obj: null | string | Date) {
    let dt = null
    if (obj instanceof Date) {
        return DateTime.fromJSDate(obj)
    }
    else if (typeof obj == "string") {
        dt = DateTime.fromISO(obj)
        if (!dt.isValid) {
            dt = DateTime.fromSQL(obj)
        }
        if (!dt.isValid) {
            dt = null
        }
    }
    return dt
}

export type TaskModelDate = {
    taskModel: MmsTaskModel,
    date: DateTime
}


export class MmsTaskService extends AbstractService {

    @InjectService
    io: IOService

    @InjectTypeORM
    typeorm: TypeORM


    *checkCompletion(task: MmsTask) {
        const currentTask: MmsTask = yield this.typeorm.findOne(
            MmsTask,
            {
                where: { id: task.id },
                relations: {
                    asset: true,
                    model: true
                }
            })

        if (!currentTask.completeDate && task.completeDate) {
            const lti: MmsLastTaskInfo = yield this.typeorm.findOne(
                MmsLastTaskInfo,
                {
                    where: {
                        asset: { id: currentTask.asset.id }
                     }
                })

            if (lti) {
                yield this.io.throwing.update(
                    MmsLastTaskInfo,
                    lti, {
                        executionDate: task.completeDate || task.executionDate
                    })
            } else {
                yield this.io.throwing.insert(
                    MmsLastTaskInfo, {
                        task,
                        asset: currentTask.asset,
                        taskModel: currentTask.model,
                        executionDate: task.completeDate || task.executionDate
                    })
            }
        }
    }

    *getInitialAttributes({ forWorkOrder }: { forWorkOrder: boolean }) {
        return yield this.typeorm.find(
            MmsStateAttribute,
            {
                where: {
                    forWorkOrder,
                    asInitialState: true
                }
            })
    }

    *generateWorkOrderCode() {
        return yield* this.getCounterValue("workOrder")
    }

    *deleteDraftTasks(asset: MmsAsset, taskModel: MmsTaskModel, lastExecution: DateTime) {
        const tasks: MmsTask[] = yield this.typeorm.find(
            MmsTask,
            {
                where: {
                    asset: { id: asset.id },
                    model: { id: taskModel.id },
                    workOrder: IsNull(),
                    scheduledDate: MoreThan(lastExecution.toJSDate())
                }
            })

        for (const task of tasks) {
            yield this.io.throwing.delete(MmsTask, task)
        }
    }


    *groupSchedulingsByTaskModel(asset: MmsAsset) {
        const lastTaskInfos: Map<MmsTaskModel, DateTime> = yield* this.getLastTaskInfos(asset)

        const schedulings: MmsScheduling[] = yield this.typeorm.find(
            MmsScheduling,
            {
                relations: {
                    areaModels: true,
                    assetAttributes: true,
                    assetModels: true,
                    taskModel: true,
                    startFromLasts: true,
                    assignedAttributes: true,
                },
                where: [
                    { startImmediately: true },
                    { taskModel: {
                        id: In(Utils.idArray(lastTaskInfos.keys())) }
                    },
                ]
            })

        const matchingSchedulings = schedulings
            .filter(s => {
                const assetModelsMatched = this.matchAssetModels(s, asset)
                const assetAttributesMatched = this.matchAssetAttributes(s, asset)
                const areaModelsMatched = this.matchAreaModels(s, asset)

                return assetModelsMatched && assetAttributesMatched && areaModelsMatched
            })


        return Utils.groupByAndMap(
            matchingSchedulings,
            Utils.unique(s => s.taskModel, lastTaskInfos.keys()),
            (schedulings, taskModel) => {
                const lastExecution = lastTaskInfos.get(taskModel)

                if (!lastExecution) {
                    return {
                        lastExecution: DateTime.now(),
                        schedulings: schedulings.filter(s => s.startImmediately)
                    }
                }
                else {
                    return { lastExecution, schedulings }
                }
            })
    }

    *generateTasks(asset: MmsAsset) {
        asset = yield this.typeorm.findOne(
            MmsAsset,
            {
                where: { id: asset.id },
                relations: {
                    attributes: true,
                    model: true,
                    area: {
                        modelAttributions: {
                            model: true
                        }
                    }
                }
            })

        const group = yield* this.groupSchedulingsByTaskModel(asset)

        for (const [ taskModel, { lastExecution, schedulings } ] of group) {

            yield* this.deleteDraftTasks(asset, taskModel, lastExecution)

            const it = this.dateGenerator(lastExecution, schedulings)

            const taskCount = Math.min(...schedulings.map(s => s.maxTaskCount || 10))

            for (let i = 0; i < taskCount; i++) {
                const res = it.next()
                if (res.done) {
                    break
                }
                const { date, scheduling } = res.value

                const code = yield* this.generateTaskCode(taskModel)

                const task: MmsTask = yield this.io.throwing.insert(MmsTask, {
                    asset,
                    model: taskModel,
                    code,
                    codePrefix: taskModel.codePrefix,
                    codeSuffix: taskModel.codeSuffix,
                    scheduledDate: date.toJSDate(),
                    stateAttributes: scheduling.assignedAttributes,
                    scheduling
                })
            }
        }



        return

//        yield* this.deleteDraftTasks(asset)

        const lastTaskInfos: MmsLastTaskInfo[] = yield* this.getLastTaskInfo(asset)
        const executedTaskModels = lastTaskInfos.map(lti => lti.taskModel)

        const schedulings: MmsScheduling[] = yield* this.getSchedulings(executedTaskModels)

        //
        // Filter the schedulings that match asset criteria
        //
        const matchingSchedulings = schedulings
            .filter(s => {
                const assetModelsMatched = this.matchAssetModels(s, asset)
                const assetAttributesMatched = this.matchAssetAttributes(s, asset)
                const areaModelsMatched = this.matchAreaModels(s, asset)

                return assetModelsMatched && assetAttributesMatched && areaModelsMatched
            })

        const taskExecutionDateMap = new Map(lastTaskInfos
            .map(lti => [ lti.taskModel.id, toDateTime(lti.executionDate) ]))

        const group1 = Utils.groupByAndMap(
            matchingSchedulings,
            s => s.taskModel,
            (s, taskModel) =>
                this.dateGenerator(
                    taskExecutionDateMap ? DateTime.now() : taskExecutionDateMap[taskModel.id],
                    s
                ))

        const taskCount = Math.min(...matchingSchedulings.map(s => s.maxTaskCount || 10))

        for (const [ model, it ] of group1) {
            for (let i = 0; i < taskCount; i++) {
                const res = it.next()
                if (res.done) {
                    break
                }
                const { date, scheduling } = res.value
                const code = yield* this.generateTaskCode(model)

                const task: MmsTask = yield this.io.throwing.insert(MmsTask, {
                    asset,
                    model,
                    code,
                    codePrefix: model.codePrefix,
                    codeSuffix: model.codeSuffix,
                    scheduledDate: date.toJSDate(),
                    stateAttributes: scheduling.assignedAttributes,
                    scheduling
                })

                yield* this.createServiceProvisions(task)
            }
        }
    }

    *createServiceProvisions(
        task: MmsTask
    ) {
        const workPlans: MmsWorkPlan[] = yield this.typeorm.find(MmsWorkPlan, {
            where: {
                taskModel: {
                    id: task.model.id
                }
            },
            relations: {
                assetModel: true,
                assetAttributes: true,
                assetComponentModel: true,
                service: true
            }
        })

        const matchingWorkPlans: MmsWorkPlan[] = workPlans
            .filter(wp => {
                const assetModelMatched = wp.assetModel == null || wp.assetModel.id == task.asset.model.id
                const assetAttributesMatched = this.matchAssetAttributes(wp, task.asset)

                return assetModelMatched && assetAttributesMatched
            })

        for (const workPlan of matchingWorkPlans) {

            const [ expectedQuantity, assetComponents ] = yield* this.calcExpectedQuantity(workPlan, task)

            yield this.io.throwing.insert(MmsServiceProvision, {
                task,
                service: workPlan.service,
                assetComponentModel: workPlan.assetComponentModel,
                expectedQuantity,
                actualQuantity: expectedQuantity,
                workPlan,
                assetComponents
            })
        }
    }

    *calcExpectedQuantity(
        workPlan: MmsWorkPlan,
        task: MmsTask
    ) {
        if (workPlan.assetModel == null ||
            workPlan.assetModel.assetType == MmsAssetType.COMPOSITE) {
            if (workPlan.assetComponentModel) {
                const components: MmsAssetComponent[] = yield this.typeorm.find(MmsAssetComponent, {
                    where: {
                        asset: { id: task.asset.id },
                        model: { id: workPlan.assetComponentModel.id }
                    }
                })

                const totalQuantity = components.map(c => c.quantity).reduce((a, b) => a + b, 0)

                return [ (totalQuantity / workPlan.assetComponentModel.unitQuantity) * workPlan.quantity, components ]
            }
        }
        else {
            return [ (task.asset.quantity / workPlan.assetModel.unitQuantity) * workPlan.quantity ]
        }

        return [ workPlan.quantity ]
    }

    *generateTaskCode(
        model: MmsTaskModel
    ) {
        const counterName = model.useGlobalCounter ? null : `taskModel-${model.id}`
        const value: number = yield* this.getCounterValue(counterName)
        return value
    }

    *getCounterValue(
        name: string | null
    ) {
        name = name || '__global'
        let counter: MmsCounter = yield this.typeorm.findOne(
            MmsCounter,
            {
                where: {
                    name
                }
            }
        )
        if (!counter) {
            counter = yield this.io.throwing.insert(MmsCounter, {
                name,
                value: 1
            })
        }
        const value = counter.value
        yield this.io.throwing.update(MmsCounter, counter, {
            value: value + 1
        })
        return value
    }

    *getLastTaskInfos(asset: MmsAsset) {
        //const info = new Map<MmsTaskModel, DateTime>()

        const taskModelIdMap = new Map<number, MmsTaskModel>()

        const tasks: MmsTask[] = yield this.typeorm.find(
            MmsTask,
            {
                relations: {
                    model: true,
                    stateAttributes: true,
                    scheduling: {
                        assignedAttributes: true
                    }
                },
                where: {
                    asset: {
                        id: asset.id
                    }
                },
                order: {
                    scheduledDate: "asc"
                }
            })

        const filtered = tasks.filter(t =>
            !t.scheduling ||
            !Utils.equalSets(Utils.idSet(t.stateAttributes), Utils.idSet(t.scheduling.assignedAttributes)))

            tasks.forEach(task => {
            taskModelIdMap.set(task.model.id, task.model)
        })

        const info = Utils.groupByAndMap(
            filtered,
            (task) => taskModelIdMap.get(task.model.id),
            (tasks) => toDateTime(tasks[tasks.length - 1].scheduledDate)
        )

        const ltis: MmsLastTaskInfo[] = yield this.typeorm.find(
            MmsLastTaskInfo,
            {
                relations: {
                    taskModel: true
                },
                where: {
                    asset: {
                        id: asset.id
                    },
                    taskModel: {
                        id: Not(In(Utils.idArray(info.keys())))
                    }
                }
            })

        for (const lti of ltis) {
            taskModelIdMap.set(lti.taskModel.id, lti.taskModel)
            info.set(taskModelIdMap.get(lti.taskModel.id), toDateTime(lti.executionDate))
        }

        return info
    }

    *getLastTaskInfo(asset: MmsAsset) {
        return yield this.typeorm.find(
            MmsLastTaskInfo,
            {
                relations: { taskModel: true },
                where: { asset: { id: asset.id } }
            })
    }

    *getSchedulings(executedTaskModels: MmsTaskModel[]) {
        return yield this.typeorm.find(
            MmsScheduling,
            {
                relations: {
                    areaModels: true,
                    assetAttributes: true,
                    assetModels: true,
                    taskModel: true,
                    startFromLasts: true,
                    assignedAttributes: true,
                },
                where: [
                    { startImmediately: true },
                    { taskModel: { id: In(executedTaskModels.map(m => m.id)) } },
                ]
            })
    }
/*
    async findNearestTaskModel(asset: MmsAsset): Promise<TaskModelDate | null> {

        const taskModelDateGenerator = await this.computeNextTaskModels(asset)

        const taskModelDates = Utils.transformMap(taskModelDateGenerator, (generator) => generator.next()?.value)
        if (taskModelDates.size == 0) {
            return null
        }

        const arr = Array.from(taskModelDates.entries())
            .reduce((a, b) => a[1] < b[1] ? a : b)

        return {
            taskModel: arr[0],
            date: arr[1]
        }
    }

    async computeNextTaskModels(asset: MmsAsset) {
        asset = await this.assetRepository.findOne({
            where: { id: asset.id },
            relations: {
                attributes: true,
                model: true,
                area: {
                    modelAttributions: {
                        model: true}
                    }
                }
            }
        )

        const schedulings = await this.findSchedulingsByAsset(asset)

        const ltis = await this.lastTaskInfoRepository
            .find({
                relations: { taskModel: true },
                where: { asset }
            })

        return Utils.groupByAndMap(
            schedulings,
            s => s.taskModel,
            (ss: MmsScheduling[], taskModel: MmsTaskModel) =>
                this.dateGenerator(
                    this.getLastTaskDate(ltis, taskModel),
                    ss
                ))
    }

    getLastTaskDate(ltis: MmsLastTaskInfo[], taskModel: MmsTaskModel) {
        const lti = ltis.find(lti => lti.taskModel.id == taskModel.id)
        return lti ? toDateTime(lti.executionDate) : null
    }*/

    *dateGenerator(startDate: DateTime, schedulings: MmsScheduling[]) {
        /*if (schedulings.some(s => s.startImmediately)) {
            startDate = DateTime.now()
        }
        if (!startDate) {
            return
        }*/
        //var currentDate = startDate
        const currentDates = new Map<MmsScheduling, DateTime>()
        schedulings.forEach(scheduling => currentDates.set(scheduling, startDate))
        while (true) {

            for (const scheduling of schedulings) {
                const date = this.calcNextDate(startDate, currentDates.get(scheduling), scheduling)
                currentDates.set(scheduling, date)
console.log(date)
                yield { scheduling, date }
            }
/*
            const ss = schedulings
                .map(scheduling => ({ scheduling, date: this.calcNextDate(startDate, currentDate, scheduling) }))
                .filter(({ date }) => date)

            if (ss.length == 0) {
                return
            }
            console.log(currentDate.toISO())
            const res = ss.reduce((min, b) => b.date < min.date ? b : min)
            console.log([ss[0].date.toISO(), ss[1].date.toISO()])

            currentDate = res.date

            yield res
*/
            /*const minScheduling = schedulings.reduce(
                (min, b) => this.calcNextDate(startDate, currentDate, b) < this.calcNextDate(startDate, currentDate, min) ? b : min,
                schedulings[0])
            currentDate = this.calcNextDate(startDate, currentDate, minScheduling)
            yield { date: currentDate, scheduling: minScheduling }*/


        }
        return { date: null, scheduling: null }
    }

    calcNextDate(startDate: DateTime, currentDate: DateTime, scheduling: MmsScheduling) {
        const unit = scheduling.unit

        const nextDate = currentDate.plus({ [unit]: scheduling.every })

        if (scheduling.maxPeriod) {
            const maxDate = startDate.plus({ [scheduling.maxPeriodUnit]: scheduling.maxPeriod })
            if (nextDate > maxDate) {
                //return null
            }
        }

        if (scheduling.startTime) {
            const { hour, minute } = DateTime.fromISO(scheduling.startTime)
            return nextDate.set({ hour, minute })
        }
        else {
            return nextDate
        }
    }
/*
    async findSchedulingsByAsset(asset: MmsAsset) {

        const executedTaskModels = (await this.lastTaskInfoRepository
            .find({
                relations: { taskModel: true },
                where: { asset }
            }))
            .map(lti => lti.taskModel)

        const schedulings = await this.schedulingRepository
            .find({
                relations: {
                    areaModels: true,
                    assetAttributes: true,
                    assetModels: true,
                    taskModel: true,
                    startFromLasts: true
                },
                where: [
                    { startImmediately: true },
                    { taskModel: In(executedTaskModels) },
                ]
            })

        return schedulings
            .filter(s => {
                const assetModelsMatched = this.matchAssetModels(s, asset)
                const assetAttributesMatched = this.matchAssetAttributes(s, asset)
                const areaModelsMatched = this.matchAreaModels(s, asset)

                return assetModelsMatched && assetAttributesMatched && areaModelsMatched
            })
    }*/

    matchAreaModels(scheduling: MmsScheduling, asset: MmsAsset) {
        //
        // If scheduling not have any area models specified, it's valid.
        //
        if (!scheduling.areaModels || scheduling.areaModels.length == 0) {
            return true
        }

        //
        // If the asset not have a area specified, this scheduling is not valid.
        //
        if (!asset.area) {
            return false
        }

        //
        // Extract model ids from attributions.
        //
        const modelIds = asset.area.modelAttributions.map(ma => ma.model.id)

        return scheduling.areaModels.some(model => modelIds.includes(model.id))
    }

    matchAssetModels(scheduling: MmsScheduling, asset: MmsAsset) {
        if (!scheduling.assetModels || scheduling.assetModels.length == 0) {
            return true
        }

        if (!asset.model) {
            return true
        }

        return scheduling.assetModels.some(model => model.id == asset.model.id)
    }

    matchAssetAttributes(scheduling: MmsScheduling | MmsWorkPlan, asset: MmsAsset) {
        if (!scheduling.assetAttributes || scheduling.assetAttributes.length == 0) {
            return true
        }

        if (!asset.attributes || asset.attributes.length == 0) {
            return false
        }

        return scheduling.assetAttributes.every(attr => asset.attributes.some(a => a.id == attr.id))
    }

    *checkWorkOrderState({ task }: { task: MmsTask }) {
        task = yield this.typeorm.findOne(
            MmsTask,
            {
                where: {
                    id: task.id
                },
                relations: {
                    workOrder: {
                        stateAttributes: true
                    }
                }
            }
        )

        const { workOrder } = task

        if (!workOrder) {
            return
        }

        const siblings: MmsTask[] = yield this.typeorm.find(
            MmsTask,
            {
                where: {
                    workOrder: {
                        id: workOrder.id
                    }
                },
                relations: {
                    stateAttributes: true
                }
            }
        )

        const states: MmsStateAttribute[] = yield this.typeorm.find(
            MmsStateAttribute,
            {
                where: {
                    forWorkOrder: true,
                    autoAssigned: true
                },
                relations: {
                    withAllTaskStates: true
                }
            }
        )

        const workOrderStates = states.filter(s => {
            return siblings.every(t => t.stateAttributes.some(ts => s.withAllTaskStates.map(ts => ts.id).includes(ts.id)))
        })

        yield this.io.throwing.update(MmsWorkOrder, workOrder, {
            stateAttributes: workOrderStates.length > 0 ? workOrderStates : workOrder.stateAttributes
        })
    }

    *triggerTaskStateChange(task: MmsTask) {

        const currentTask: MmsTask = yield this.typeorm.findOne(
            MmsTask,
            {
                where: {
                    id: task.id
                },
                relations: {
                    stateAttributes: true,
                    workOrder: true
                }
            }
        )

        const states: MmsStateAttribute[] = yield this.typeorm.find(
            MmsStateAttribute,
            {
                where: {
                    id: In(currentTask.stateAttributes.map(a => a.id)),
                }
            }
        )

        if (task.workOrder) {
            task.stateAttributes = states.filter(s => s.withWorkOrder === null || s.withWorkOrder === true)

            //
            // There is a assignment to a work order
            //
            if (!currentTask.workOrder) {
                const autoStates: MmsStateAttribute[] = yield this.typeorm.find(
                    MmsStateAttribute,
                    {
                        where: {
                            forTask: true,
                            autoAssigned: true,
                            withWorkOrder: true
                        }
                    }
                )

                task.stateAttributes = [
                    ...task.stateAttributes,
                    ...autoStates
                ]
            }
        } else {
            if (!currentTask.workOrder) {
                //task.stateAttributes = states.filter(s => s.withWorkOrder === null || s.withWorkOrder === false)
            }
        }


        /*
        if (!task.closingReason) {
            return
        }

        const currentTask: MmsTask = yield this.typeorm.findOne(MmsTask, {
            where: {
                id: task.id
            },
            relations: {
                asset: true,
                workOrder: true,
                closingReason: true
            }
        })

        if (task.closingReason.id != currentTask.closingReason?.id) {
            const closingReason: MmsTaskClosingReason = yield this.typeorm.findOne(MmsTaskClosingReason, {
                where: {
                    id: task.closingReason.id
                },
                relations: {
                    assignedAttributes: true
                }
            })

            for (const attribute of closingReason.assignedAttributes) {
                if (attribute.forTask) {
                    task.stateAttributes = Utils.distinct([
                        ...task.stateAttributes || [],
                        attribute
                    ], 'id')
                }

                if (attribute.forAsset) {
                    yield this.io.throwing.update(MmsAsset, currentTask.asset, {
                        stateAttributes: Utils.distinct([
                            ...task.stateAttributes || [],
                            attribute
                        ], 'id')
                    })
                }

                if (attribute.forWorkOrder && currentTask.workOrder) {
                    yield this.io.throwing.update(MmsWorkOrder, currentTask.workOrder, {
                        stateAttributes: Utils.distinct([
                            ...task.stateAttributes || [],
                            attribute
                        ], 'id')
                    })
                }
            }
        }*/
    }


}

