import { Transaction } from "@adronix/persistence";
import { AbstractService, InjectService, IOService, Utils } from "@adronix/server";
import { InjectDataSource, TypeORMTransaction } from "@adronix/typeorm";
import { DateTime } from "luxon";
import { DataSource, EntityManager, In, InitializedRelationError } from "typeorm";
import { MmsArea } from "../persistence/entities/MmsArea";
import { MmsAreaModel } from "../persistence/entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "../persistence/entities/MmsAreaModelAttribution";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { MmsAssetComponent } from "../persistence/entities/MmsAssetComponent";
import { MmsAssetComponentModel } from "../persistence/entities/MmsAssetComponentModel";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsAssetModelPivot } from "../persistence/entities/MmsAssetModelPivot";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { MmsLastTaskInfo } from "../persistence/entities/MmsLastTaskInfo";
import { MmsPart } from "../persistence/entities/MmsPart";
import { MmsPartRequirement } from "../persistence/entities/MmsPartRequirement";
import { MmsResourceModel } from "../persistence/entities/MmsResourceModel";
import { MmsResourceType } from "../persistence/entities/MmsResourceType";
import { MmsScheduling } from "../persistence/entities/MmsScheduling";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";

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

function getEntityManager() {
    return async (t: TypeORMTransaction) => t.entityManager
}

const findOne = EntityManager.prototype.findOne

export class MmsService extends AbstractService {

    @InjectDataSource
    dataSource: DataSource

    @InjectService
    ioService: IOService


    *createCompositeAsset(location: MmsClientLocation, model: MmsAssetModel) {

        const em: EntityManager = yield getEntityManager()

        const loc = yield findOne(MmsClientLocation, {
            where: { id: location.id},
            relations: { client: true }
        })
        console.log(loc)

        const asset = yield this.ioService.insert(MmsAsset, {
            location,
            model,
            name: 'Sede',
            client: loc.client
        })

        console.log(asset)
        /*

        return async (t: Transaction) => {
            const loc = await this.clientLocationRepository.findOne({
                where: { id: location.id},
                relations: { client: true }
            })
            const asset = await this.ioService.insert(MmsAsset, {
                location,
                model,
                name: 'Sede',
                client: loc.client
            })(t)
            const pivots = await this.assetModelPivotRepository
                .find({
                    where: { assetModel: model },
                    relations: { areaModel: true, componentModel: true }
                })

            const groups = Utils.groupBy(pivots, item => item.rowGroup)

            //for (const pivot of pivots) {
            for (const rowGroup in groups) {
                const area = this.ioService.insert(MmsArea, {
                    name: groups[rowGroup]
                })(t)
                for (const pivot of groups[rowGroup]) {
                    for (var i = 0; i < pivot.quantity; i++) {
                        this.ioService.insert(MmsAssetComponent, {
                            quantity: 1,
                            name: i,
                            asset,
                            model: pivot.componentModel,
                            area
                        })
                    }
                }
            }
        }*/
    }

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
            (ss: MmsScheduling[], taskModel: MmsTaskModel) => this.dateGenerator(
                this.getLastTaskDate(ltis, taskModel),
                ss))
    }

    getLastTaskDate(ltis: MmsLastTaskInfo[], taskModel: MmsTaskModel) {
        const lti = ltis.find(lti => lti.taskModel.id == taskModel.id)
        return lti ? toDateTime(lti.executionDate) : null
    }

    *dateGenerator(startDate: DateTime, schedulings: MmsScheduling[]) {
        if (!startDate) {
            return
        }
        var currentDate = startDate
        while (true) {
            const minScheduling = schedulings.reduce(
                (min, b) => this.calcNextDate(currentDate, b) < this.calcNextDate(currentDate, min) ? b : min,
                schedulings[0])
            currentDate = this.calcNextDate(currentDate, minScheduling)
            yield currentDate
        }
        return startDate
    }

    calcNextDate(startDate: DateTime, scheduling: MmsScheduling) {
        const unit = scheduling.unit
        return startDate.plus({ [unit]: scheduling.every })
    }

    async findSchedulingsByAsset(asset: MmsAsset) {

        const executedTaskModels = (await this.lastTaskInfoRepository
            .find({
                relations: {taskModel: true },
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
                where: {
                    taskModel: In(executedTaskModels)
                }
            })

        return schedulings
            .filter(s => {
                const assetModelsMatched = this.matchAssetModels(s, asset)
                const assetAttributesMatched = this.matchAssetAttributes(s, asset)
                const areaModelsMatched = this.matchAreaModels(s, asset)

                return assetModelsMatched && assetAttributesMatched && areaModelsMatched
            })
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

        return scheduling.assetModels.some(model => model.id == asset.model.id)
    }

    matchAssetAttributes(scheduling: MmsScheduling, asset: MmsAsset) {
        if (!scheduling.assetAttributes || scheduling.assetAttributes.length == 0) {
            return true
        }

        if (!asset.attributes || asset.attributes.length == 0) {
            return false
        }

        return scheduling.assetAttributes.every(attr => asset.attributes.some(a => a.id == attr.id))
    }

    get clientRepository() {
        return this.dataSource.getRepository(MmsClient)
    }

    get clientLocationRepository() {
        return this.dataSource.getRepository(MmsClientLocation)
    }

    get areaRepository() {
        return this.dataSource.getRepository(MmsArea)
    }

    get areaModelRepository() {
        return this.dataSource.getRepository(MmsAreaModel)
    }

    get areaModelAttributionRepository() {
        return this.dataSource.getRepository(MmsAreaModelAttribution)
    }

    get assetRepository() {
        return this.dataSource.getRepository(MmsAsset)
    }

    get assetModelRepository() {
        return this.dataSource.getRepository(MmsAssetModel)
    }

    get assetComponentModelRepository() {
        return this.dataSource.getRepository(MmsAssetComponentModel)
    }

    get assetModelPivotRepository() {
        return this.dataSource.getRepository(MmsAssetModelPivot)
    }

    get resourceTypeRepository() {
        return this.dataSource.getRepository(MmsResourceType)
    }

    get resourceModelRepository() {
        return this.dataSource.getRepository(MmsResourceModel)
    }

    get partRepository() {
        return this.dataSource.getRepository(MmsPart)
    }

    get taskModelRepository() {
        return this.dataSource.getRepository(MmsTaskModel)
    }

    get partRequirementRepository() {
        return this.dataSource.getRepository(MmsPartRequirement)
    }

    get assetAttributeRepository() {
        return this.dataSource.getRepository(MmsAssetAttribute)
    }

    get lastTaskInfoRepository() {
        return this.dataSource.getRepository(MmsLastTaskInfo)
    }

    get schedulingRepository() {
        return this.dataSource.getRepository(MmsScheduling)
    }

    get assetComponentRepository() {
        return this.dataSource.getRepository(MmsAssetComponent)
    }


}

