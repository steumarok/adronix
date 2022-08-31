import { AbstractService, InjectService, IOService, Utils } from "@adronix/server";
import { InjectTypeORM, TypeORM } from "@adronix/typeorm";
import { DateTime } from "luxon";
import { In } from "typeorm";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetComponent } from "../persistence/entities/MmsAssetComponent";
import { MmsAssetType } from "../persistence/entities/MmsAssetModel";
import { MmsCounter } from "../persistence/entities/MmsCounter";
import { MmsLastTaskInfo } from "../persistence/entities/MmsLastTaskInfo";
import { MmsScheduling } from "../persistence/entities/MmsScheduling";
import { MmsServiceProvision } from "../persistence/entities/MmsServiceProvision";
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

    *generateWorkOrderCode() {
        return yield* this.getCounterValue("workOrder")
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

        const tasks: MmsTask[] = yield this.typeorm.find(
            MmsTask,
            {
                where: {
                    executionDate: null,
                    asset: { id: asset.id }
                }
            })

        for (const task of tasks) {
            yield this.io.throwing.delete(MmsTask, task)
        }

        const lastTaskInfos: MmsLastTaskInfo[] = yield* this.getLastTaskInfo(asset)
        const executedTaskModels = lastTaskInfos.map(lti => lti.taskModel)

        const schedulings: MmsScheduling[] = yield* this.getSchedulings(executedTaskModels)

        const matchingSchedulings = schedulings
            .filter(s => {
                const assetModelsMatched = this.matchAssetModels(s, asset)
                const assetAttributesMatched = this.matchAssetAttributes(s, asset)
                const areaModelsMatched = this.matchAreaModels(s, asset)

                return assetModelsMatched && assetAttributesMatched && areaModelsMatched
            })

        const group1 = Utils.groupByAndMap(
            matchingSchedulings.filter(s => s.startImmediately),
            s => s.taskModel,
            s =>
                this.dateGenerator(
                    DateTime.now(),
                    s
                ))

        for (const [ model, it ] of group1) {
            for (let i = 0; i < 10; i++) {
                const { date, scheduling } = it.next().value
                const code = yield* this.generateTaskCode(model)

                const task: MmsTask = yield this.io.throwing.insert(MmsTask, {
                    asset,
                    model,
                    code,
                    codePrefix: model.codePrefix,
                    codeSuffix: model.codeSuffix,
                    scheduledDate: date.toJSDate(),
                    stateAttributes: scheduling.assignedAttributes
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
                    { taskModel: In(executedTaskModels) },
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
        if (schedulings.some(s => s.startImmediately)) {
            startDate = DateTime.now()
        }
        if (!startDate) {
            return
        }
        var currentDate = startDate
        while (true) {
            const minScheduling = schedulings.reduce(
                (min, b) => this.calcNextDate(currentDate, b) < this.calcNextDate(currentDate, min) ? b : min,
                schedulings[0])
            currentDate = this.calcNextDate(currentDate, minScheduling)
            yield { date: currentDate, scheduling: minScheduling }
        }
        return { date: null, scheduling: null }
    }

    calcNextDate(startDate: DateTime, scheduling: MmsScheduling) {
        const unit = scheduling.unit
        const nextDate = startDate.plus({ [unit]: scheduling.every })
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


    *triggerTaskStateChange(task: MmsTask) {
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
        }
    }


}

