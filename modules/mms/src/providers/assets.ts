import { HttpContext, PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsRepoService } from "../services/MmsRepoService";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { CmnLocality, CmnMeasurementUnit } from "@adronix/cmn";
import { MmsArea } from "../persistence/entities/MmsArea";
import { Brackets, In, Like, Repository } from "typeorm";
import { Utils } from "@adronix/server";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { MmsLastTaskInfo } from "../persistence/entities/MmsLastTaskInfo";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";
import { MmsAssetComponent } from "../persistence/entities/MmsAssetComponent";
import { MmsAssetComponentModel } from "../persistence/entities/MmsAssetComponentModel";
import { MmsTaskService } from "../services/MmsTaskService";
import { MmsChecklist } from "../persistence/entities/MmsChecklist";
import { MmsChecklistModel } from "../persistence/entities/MmsChecklistModel";
import { DateTime } from "luxon";
import { MmsChecklistItem } from "../persistence/entities/MmsChecklistItem";
import { MmsChecklistItemModel } from "../persistence/entities/MmsChecklistItemModel";
import { MmsChecklistItemOption } from "../persistence/entities/MmsChecklistItemOption";


export const assetsProviders: DataProviderDefinitions = {

    '/listAssets': {
        handler: async function ({ page, limit, sortBy, descending, filter, clientId, clientLocationId }) {

            const service = this.service(MmsRepoService)

            const where = {
                ...Utils.where(filter, { name: Like(`${filter}%`) }),
                ...Utils.where(clientId, { client: { id: clientId } }),
                ...Utils.where(clientLocationId, { location: { id: clientLocationId } })
            }

            const [ rows, count ] = await service.assetRepository
                .createQueryBuilder('a')
                //.loadRelationCountAndMap('a.locationCount', 'a.locations')
                .leftJoinAndSelect('a.model', 'model')
                .leftJoinAndSelect('a.client', 'client')
                .leftJoinAndSelect('a.location', 'location')
                .leftJoinAndSelect('location.locality', 'localitt')
                .where(where)
                .skip((Utils.toInt(page) - 1) * Utils.toInt(limit))
                .take(Utils.toInt(limit))
                .orderBy('a.' + sortBy, Utils.toBool(descending) ? "DESC": "ASC")
                .getManyAndCount();

            /*
            const dateMap = new Map<MmsAsset, TaskModelDate>()
            for (const asset of rows) {
                const taskDate = await service.findNearestTaskModel(asset)
                if (taskDate) {
                    dateMap.set(asset, taskDate)
                }
            }

            this.output.add(MmsAsset, "nextTaskModel", (asset) => dateMap.get(asset)?.taskModel)
            this.output.add(MmsAsset, "nextTaskDate", (asset) => dateMap.get(asset)?.date?.toISO())
            */

            const results = [PaginatedList(MmsAsset, rows, count)]

            if (clientId) {
                results.push(await service.clientRepository.findOneBy({ id: clientId }))
            }
            if (clientLocationId) {
                results.push(await service.clientLocationRepository.findOne({
                    where: { id: clientLocationId },
                    relations: { locality: true }
                }))
            }

            return results
        },
        output: [
            [MmsAsset, 'name', 'client', 'location', 'model'],
            [MmsClient, 'name'],
            [MmsAssetModel, 'name', 'assetType'],
            [MmsClientLocation, 'address', 'locality'],
            [CmnLocality, 'name'],
        ]
    },

    '/editAsset': {
        handler: async function({ id }) {

            this.output.add(MmsClientLocation,
                'displayName', location => `${location.address} - ${location.locality?.name}`)

            const asset =
                id
                    ? await this.service(MmsRepoService).assetRepository
                        .findOne({
                            relations: {
                                attributes: {
                                    incompatibleAttributes: true
                                },
                                model: true,
                                client: true,
                                area: true,
                                location: {
                                    locality: true} },
                            where: { id }})
                    : new MmsAsset()

            let ltis = []
            if (id) {
                ltis = await this.service(MmsRepoService).lastTaskInfoRepository
                    .find({
                        relations: { asset: true, taskModel: true },
                        where: { asset }
                    })
            }

            return [asset, ...ltis]
        },
        sync: {
            onAfterUpdate: [
                [
                    MmsAsset,
                    function* (changes, asset: MmsAsset) {
                        if (changes.recreateTasks) {
                            yield* this.service(MmsTaskService).generateTasks(asset)
                        }
                    }
                ]
            ]
        },
        output: [
            [MmsAsset, 'name', 'client', 'location', 'model', 'area', 'attributes'],
            [MmsClientLocation, 'address', 'locality'],
            [MmsClient, 'name'],
            [MmsAssetAttribute, 'name', 'incompatibleAttributes'],
            [MmsArea, 'name'],
            [MmsAssetModel, 'name'],
            [MmsLastTaskInfo, 'executionDate', 'taskModel', 'asset'],
            [MmsTaskModel, 'name'],
        ]
    },


    '/listAssetComponents': {
        handler: async function ({ page, limit, assetId, sortBy, descending }) {

            const asset = await this.service(MmsRepoService).assetRepository
                    .findOneBy({ id: Utils.toInt(assetId) })

            const [ rows, count ] = await this.service(MmsRepoService).assetComponentRepository
                .findAndCount({
                    relations: { model: { measurementUnit: true }, asset: true, area: true },
                    where: { asset: { id: asset.id } },
                    skip: (Utils.toInt(page) - 1) * Utils.toInt(limit),
                    take: Utils.toInt(limit),
                    ...Utils.orderClause(sortBy, descending)
                })

            return [PaginatedList(MmsAssetComponent, rows, count)].concat([asset])

        },
        output: [
            [MmsAssetComponent, 'model', 'name', 'quantity', 'area'],
            [MmsAsset, 'name'],
            [MmsAssetComponentModel, 'name', 'measurementUnit'],
            [CmnMeasurementUnit, 'name'],
            [MmsArea, 'name']
        ]
    },

    '/editAssetComponent': {
        handler: async function({ id, assetId }) {

            let assetComponent: MmsAssetComponent
            if (id) {
                assetComponent = await this.service(MmsRepoService).assetComponentRepository
                    .findOne({
                        relations: {
                            model: { measurementUnit: true },
                            area: true,
                            asset: { client: true, location: true }
                        },
                        where: { id }})
            } else {
                assetComponent = new MmsAssetComponent()
                assetComponent.asset = await this.service(MmsRepoService).assetRepository
                        .findOne({
                            relations: { client: true, location: true },
                            where: { id: assetId }
                        })
            }
            return [assetComponent]
        },
        output: [
            [MmsAssetComponent, 'name', 'quantity', 'asset', 'model', 'area'],
            [MmsClient, 'name'],
            [MmsAsset, 'name', 'client', 'location'],
            [MmsArea, 'name'],
            [MmsClientLocation, 'name'],
            [MmsAssetComponentModel, 'name', 'measurementUnit'],
            [CmnMeasurementUnit, 'name'],
        ]
    },


    '/listChecklists': {
        handler: async function ({ assetId, sortBy, descending }) {

            const asset = await this.service(MmsRepoService).assetRepository
                    .findOneBy({ id: Utils.toInt(assetId) })

            const [ rows, count ] = await this.service(MmsRepoService).checklistRepository
                .findAndCount({
                    relations: {
                        asset: true,
                        assetComponent: true,
                        model: true
                    },
                    where: { asset: { id: asset.id } },
                    ...Utils.orderClause(sortBy, descending)
                })

            return [PaginatedList(MmsChecklist, rows, count)].concat([asset])

        },
        output: [
            [MmsChecklist, 'model', 'asset', 'compilationDate'],
            [MmsAsset, 'name'],
            [MmsChecklistModel, 'name'],
        ]
    },

    '/editChecklist': {
        handler: async function({ id, assetId }) {

            const result = []

            if (id) {
                const checklist = await this.service(MmsRepoService).checklistRepository
                    .findOne({
                        relations: {
                            asset: true,
                            assetComponent: true,
                            model: true
                        },
                        where: { id }})
                result.push(checklist)
            } else {
                const asset = await this.service(MmsRepoService).assetRepository
                .findOne({
                    relations: {
                        model: {
                            checklistModel: true
                        }
                    },
                    where: { id: assetId }
                })

                const assetComponents = await this.service(MmsRepoService).assetComponentRepository
                    .find({
                        where: {
                            asset: { id: asset.id },
                        },
                        relations: {
                            model: {
                                checklistItemModels: true
                            }
                        }
                    })

                const checklist = new MmsChecklist()
                checklist.compilationDate = DateTime.now().toJSDate()
                checklist.asset = asset
                checklist.model = checklist.asset.model.checklistModel

                result.push(checklist)

                const itemModelIds = new Set<number>()

                for (const component of assetComponents) {
                    for (const itemModel of component.model.checklistItemModels) {
                        const item = new MmsChecklistItem()
                        item.itemModel = itemModel
                        item.assetComponent = component
                        item.checklist = checklist
                        result.push(item)

                        itemModelIds.add(itemModel.id)
                    }
                }

                const options = await this.service(MmsRepoService).checklistItemOptionRepository
                    .find({
                        where: {
                            model: {
                                id: In(Array.from(itemModelIds))
                            }
                        },
                        relations: {
                            model: true
                        }
                    })

                result.push(...options)
            }
            return result
        },
        output: [
            [MmsChecklist, 'model', 'asset', 'compilationDate'],
            [MmsAsset, 'name'],
            [MmsChecklistModel, 'name'],
            [MmsAssetComponent, 'name', 'asset'],
            [MmsChecklistItem, 'checklist', 'itemModel', 'assetComponent', 'value'],
            [MmsChecklistItemModel, 'text', 'dataType'],
            [MmsChecklistItemOption, 'model', 'value', 'desc', 'seq'],
        ]
    },
}

