import { AbstractService, InjectService, IOService, Utils } from "@adronix/server";
import { InjectTypeORM, TypeORM } from "@adronix/typeorm";
import { setServers } from "dns";
import { DateTime } from "luxon";
import { In, IsNull, MoreThan, Not, Raw } from "typeorm";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetComponent } from "../persistence/entities/MmsAssetComponent";
import { MmsAssetType } from "../persistence/entities/MmsAssetModel";
import { MmsCounter } from "../persistence/entities/MmsCounter";
import { MmsLastTaskInfo } from "../persistence/entities/MmsLastTaskInfo";
import { MmsScheduling, MmsSchedulingType } from "../persistence/entities/MmsScheduling";
import { MmsServiceProvision } from "../persistence/entities/MmsServiceProvision";
import { MmsStateAttribute } from "../persistence/entities/MmsStateAttribute";
import { MmsTask } from "../persistence/entities/MmsTask";
import { MmsTaskClosingReason } from "../persistence/entities/MmsTaskClosingReason";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";
import { MmsTaskStateChange } from "../persistence/entities/MmsTaskStateChange";
import { MmsWorkOrder } from "../persistence/entities/MmsWorkOrder";
import { MmsWorkOrderStateChange } from "../persistence/entities/MmsWorkOrderStateChange";
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


    *checkCompletion(
        task: MmsTask
    ) {
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
                        asset: { id: currentTask.asset.id },
                        taskModel: { id: currentTask.model.id }
                    }
                })

            if (lti) {
                yield this.io.throwing.update(
                    MmsLastTaskInfo,
                    lti,
                    {
                        executionDate: task.completeDate || task.executionDate
                    })
            } else {
                yield this.io.throwing.insert(
                    MmsLastTaskInfo,
                    {
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
                    scheduledDate: MoreThan(lastExecution.toJSDate()),
                    scheduling: {
                        schedulingType: MmsSchedulingType.PERIODIC
                    }
                }
            })

        for (const task of tasks) {
            yield this.io.throwing.delete(MmsTask, task)
        }
    }


    protected *groupSchedulingsByTaskModel(
        asset: MmsAsset,
        schedulingType: MmsSchedulingType
    ) {
        const lastTaskInfos: Map<MmsTaskModel, MmsTask> = yield* this.getLastTasks(asset)

        const schedulings: MmsScheduling[] = yield this.typeorm.find(
            MmsScheduling,
            {
                relations: {
                    areaModels: true,
                    assetAttributes: true,
                    assetModels: true,
                    taskModel: true,
                    assignedAttributes: true,
                    triggerStateAttributes: true,
                    triggerTaskModel: true
                },
                where: schedulingType == MmsSchedulingType.PERIODIC
                    ? [
                        { schedulingType, startImmediately: true },
                        { schedulingType, taskModel: {
                            id: In(Utils.idArray(lastTaskInfos.keys())) }
                        }
                    ]
                    : { schedulingType }
            })

        const matchingSchedulings = schedulings
            .filter(s => {
                const assetModelsMatched = this.matchAssetModels(s, asset)
                const assetAttributesMatched = this.matchAssetAttributes(s, asset)
                const areaModelsMatched = this.matchAreaModels(s, asset)

                if (schedulingType == MmsSchedulingType.TRIGGERED) {
                    const triggerTask = Utils.mapGet(lastTaskInfos, s.triggerTaskModel)

                    if (!triggerTask ||
                        !triggerTask.executionDate ||
                        !Utils.idArray(s.triggerStateAttributes).some(id => Utils.idSet(triggerTask.stateAttributes).has(id))) {
                        return false
                    }
                }

                return assetModelsMatched && assetAttributesMatched && areaModelsMatched
            })

        return Utils.groupByAndMap(
            matchingSchedulings,
            Utils.unique(s => s.taskModel, lastTaskInfos.keys()),
            (schedulings, taskModel) => {

                let lastTask: MmsTask
                if (schedulingType == MmsSchedulingType.TRIGGERED) {
                    lastTask = schedulings
                        .map(s => Utils.mapGet(lastTaskInfos, s.triggerTaskModel))
                        .reduce((a, b) => toDateTime(a.executionDate) < toDateTime(b.executionDate) ? a : b)

                } else {
                    lastTask = lastTaskInfos.get(taskModel)
                }

                if (!lastTask) {
                    return {
                        lastTask: null,
                        schedulings: schedulings.filter(s => s.startImmediately)
                    }
                }
                else {
                    return {
                        lastTask,
                        schedulings
                    }
                }
            })
    }

    *generatePeriodicTasks(asset: MmsAsset) {
        return yield* this.generateTasks(asset, MmsSchedulingType.PERIODIC)
    }

    *generateTriggeredTasks(asset: MmsAsset) {
        const g = yield* this.generateTasks(asset, MmsSchedulingType.TRIGGERED)
    }

    protected *generateTasks(asset: MmsAsset, schedulingType: MmsSchedulingType) {
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

        const group = yield* this.groupSchedulingsByTaskModel(asset, schedulingType)

        const tasks = []
        for (const [ taskModel, { lastTask, schedulings } ] of group) {

            const executionDate = lastTask ? toDateTime(lastTask.executionDate) : DateTime.now()

            if (schedulingType == MmsSchedulingType.PERIODIC) {
                yield* this.deleteDraftTasks(asset, taskModel, executionDate)
            }

            const it = this.dateGenerator(executionDate, schedulings)

            const taskCount = schedulingType == MmsSchedulingType.PERIODIC
                ? Math.min(...schedulings.map(s => s.maxTaskCount || 10))
                : 1

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
                    scheduling,
                    triggerTask: lastTask.id ? lastTask : null
                })

                yield* this.createServiceProvisions(task)

                tasks.push(task)
            }
        }

        return tasks
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

    /**
     * Retrieve the last tasks executed for a specific asset
     * @param asset
     * @returns a map of task model -> task
     */
    protected *getLastTasks(asset: MmsAsset) {
        const taskModelIdMap = new Map<number, MmsTaskModel>()

        //
        // The id condition limit the extracted tasks to which that
        // not triggered any tasks (they already triggered so no need consider)
        //
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
                    },
                    id: Raw(alias =>
                        `not exists (select 1 from mms_tasks t where t.triggerTaskId=${alias})`)
                },
                order: {
                    scheduledDate: "asc"
                }
            })

        //
        // Are considered only the tasks manually inserted (with scheduling empty) and
        // only those without any state change (their state attributes are the same when
        // they were created)
        //
        const filtered = tasks.filter(t =>
            !t.scheduling ||
            !Utils.equalSets(
                Utils.idSet(t.stateAttributes),
                Utils.idSet(t.scheduling.assignedAttributes)))

        //
        // Workaround for the typeorm problem that returns different object instances
        // representing same record
        //
        tasks.forEach(task => {
            taskModelIdMap.set(task.model.id, task.model)
        })

        //
        // Groups the tasks by task model and takes last task
        //
        const info = Utils.groupByAndMap(
            filtered,
            (task) => taskModelIdMap.get(task.model.id),
            (tasks) => tasks[tasks.length - 1]
        )

        //
        // Estracts the last lask infos specified by the user
        // excluding the one they extracted before (because more recent)
        // and creates fake task objects as a placeholder for those infos.
        //
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

            const task = new MmsTask()
            task.executionDate = lti.executionDate
            task.completeDate = lti.executionDate
            task.model = lti.taskModel
            task.stateAttributes = []

            info.set(taskModelIdMap.get(lti.taskModel.id), task)
        }

        return info
    }

    /**
     * Generator function that calculates next dates for the specified
     * schedulings
     * @param startDate
     * @param schedulings
     * @returns a generator of pair of scheduling and next date
     */
    protected *dateGenerator(
        startDate: DateTime,
        schedulings: MmsScheduling[]
    ) {
        if (schedulings.length == 0) {
            return
        }

        const currentDates = new Map<MmsScheduling, DateTime>()
        schedulings.forEach(scheduling => {
            currentDates.set(scheduling, startDate)
        })

        while (true) {
            let stop = true
            for (const scheduling of schedulings) {
                const currentDate = currentDates.get(scheduling)

                if (currentDate) {
                    const date = this.calcNextDate(
                        startDate,
                        currentDates.get(scheduling),
                        scheduling)

                    if (!date) {
                        currentDates.delete(scheduling)
                    }
                    else {
                        stop = false

                        currentDates.set(scheduling, date)

                        yield { scheduling, date }
                    }
                }
            }
            if (stop) {
                return
            }
        }
        return { date: null, scheduling: null }
    }

    /**
     * Calculates next date based on the specified scheduling
     * @param startDate
     * @param currentDate
     * @param scheduling
     * @returns a date or null if exceeded the maximum limit
     */
    protected calcNextDate(
        startDate: DateTime,
        currentDate: DateTime,
        scheduling: MmsScheduling
    ) {
        const unit = scheduling.unit

        const nextDate = currentDate.plus({ [unit]: scheduling.every })

        if (scheduling.maxPeriod) {
            const maxDate = startDate.plus({ [scheduling.maxPeriodUnit]: scheduling.maxPeriod })
            if (nextDate > maxDate) {
                return null
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

        //
        // New work order states are assigned if state attributes of all tasks
        // meet the attribute based criterias specified in the work order state attribute
        //
        const stateAttributes = states.filter(s => {
            return siblings.every(t => t.stateAttributes.some(ts => s.withAllTaskStates.map(ts => ts.id).includes(ts.id)))
        })

        if (stateAttributes.length > 0) {
            yield this.io.throwing.update(MmsWorkOrder, workOrder, {
                stateAttributes
            })
        }
    }



    private *checkWorkOrderStateChanges(
        incomingWorkOrder: MmsWorkOrder,
        storedWorkOrder: MmsWorkOrder
    ) {
        if (!incomingWorkOrder.stateAttributes) {
            return
        }

        if (!Utils.equalSets(
                Utils.idSet(incomingWorkOrder.stateAttributes),
                Utils.idSet(storedWorkOrder.stateAttributes))) {
            const previous: MmsWorkOrderStateChange = yield this.typeorm.findOne(
                MmsWorkOrderStateChange, {
                where: {
                    workOrder: {
                        id: incomingWorkOrder.id
                    }
                },
                order: {
                    timestamp: "desc"
                },
                relations: {
                    lastTaskStateChanges: true
                }
            })

            const lastTaskStateChanges: MmsTaskStateChange[] = yield this.typeorm.find(
                MmsTaskStateChange, {
                    where: {
                        task: {
                            workOrder: {
                                id: incomingWorkOrder.id
                            }
                        },
                        id: Raw(alias =>
                            `not exists (select 1 from mms_task_state_changes where previousId=${alias})`)
                    },
                    relations: {
                        task: {
                            asset: true
                        },
                        previousAttributes: true,
                        currentAttributes: true
                    }
                })

            yield this.io.throwing.insert(
                MmsWorkOrderStateChange, {
                    previous,
                    workOrder: incomingWorkOrder,
                    timestamp: DateTime.now().toJSDate(),
                    previousAttributes: storedWorkOrder.stateAttributes,
                    currentAttributes: incomingWorkOrder.stateAttributes,
                    lastTaskStateChanges
                }
            )

            const assets = Utils.distinct(lastTaskStateChanges.map(c => c.task.asset), 'id')

            for (const asset of assets) {
                yield* this.generateTriggeredTasks(asset)
            }
        }
    }

    *triggerWorkOrderStateChange(incomingWorkOrder: MmsWorkOrder) {

        const storedWorkOrder: MmsWorkOrder = yield this.typeorm.findOne(
            MmsWorkOrder,
            {
                where: {
                    id: incomingWorkOrder.id
                },
                relations: {
                    stateAttributes: true
                }
            }
        )

        /*
        const states: MmsStateAttribute[] = yield this.typeorm.find(
            MmsStateAttribute,
            {
                where: {
                    id: In(storedWorkOrder.stateAttributes.map(a => a.id)),
                }
            }
        )
        */

        yield* this.checkWorkOrderStateChanges(incomingWorkOrder, storedWorkOrder)

    }

    private *checkTaskStateChanges(incomingTask: MmsTask, storedTask: MmsTask) {
        if (!incomingTask.stateAttributes) {
            return
        }

        if (!Utils.equalSets(
                Utils.idSet(incomingTask.stateAttributes),
                Utils.idSet(storedTask.stateAttributes))) {
            const previous: MmsTaskStateChange = yield this.typeorm.findOne(
                MmsTaskStateChange, {
                where: {
                    task: {
                        id: incomingTask.id
                    }
                },
                order: {
                    timestamp: "desc"
                }
            })
            yield this.io.throwing.insert(
                MmsTaskStateChange, {
                    previous,
                    task: incomingTask,
                    timestamp: DateTime.now().toJSDate(),
                    previousAttributes: storedTask.stateAttributes,
                    currentAttributes: incomingTask.stateAttributes,
                }
            )
        }
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

        yield* this.checkTaskStateChanges(task, currentTask)

        if (task.workOrder) {
            //
            // Excludes the state attributes that are not foreseen
            // in case of assignment to a work order
            //
            task.stateAttributes = currentTask.stateAttributes.filter(
                s => s.withWorkOrder === null || s.withWorkOrder === true)

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
    }


}

