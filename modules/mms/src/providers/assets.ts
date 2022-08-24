import { HttpContext, PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsService, TaskModelDate } from "../services/MmsService";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { CmnLocality, CmnMeasurementUnit } from "@adronix/cmn";
import { MmsArea } from "../persistence/entities/MmsArea";
import { Brackets, Like, Repository } from "typeorm";
import { Utils } from "@adronix/server";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { MmsLastTaskInfo } from "../persistence/entities/MmsLastTaskInfo";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";
import { MmsAssetComponent } from "../persistence/entities/MmsAssetComponent";
import { MmsAssetComponentModel } from "../persistence/entities/MmsAssetComponentModel";


export const assetsProviders: DataProviderDefinitions = {

    '/listAssets': {
        handler: async function ({ page, limit, sortBy, descending, filter, clientId, clientLocationId }) {

            const service = this.service(MmsService)

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

            const dateMap = new Map<MmsAsset, TaskModelDate>()
            for (const asset of rows) {
                const taskDate = await service.findNearestTaskModel(asset)
                if (taskDate) {
                    dateMap.set(asset, taskDate)
                }
            }

            this.output.add(MmsAsset, "nextTaskModel", (asset) => dateMap.get(asset)?.taskModel)
            this.output.add(MmsAsset, "nextTaskDate", (asset) => dateMap.get(asset)?.date?.toISODate())

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
                    ? await this.service(MmsService).assetRepository
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
                ltis = await this.service(MmsService).lastTaskInfoRepository
                    .find({
                        relations: { asset: true, taskModel: true },
                        where: { asset }
                    })
            }

            return [asset, ...ltis]
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

            const asset = await this.service(MmsService).assetRepository
                    .findOneBy({ id: Utils.toInt(assetId) })

            const [ rows, count ] = await this.service(MmsService).assetComponentRepository
                .findAndCount({
                    relations: { model: { measurementUnit: true }, asset: true, area: true },
                    where: { asset },
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
                assetComponent = await this.service(MmsService).assetComponentRepository
                    .findOne({
                        relations: {
                            model: { measurementUnit: true },
                            area: true,
                            asset: { client: true, location: true }
                        },
                        where: { id }})
            } else {
                assetComponent = new MmsAssetComponent()
                assetComponent.asset = await this.service(MmsService).assetRepository
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
}

