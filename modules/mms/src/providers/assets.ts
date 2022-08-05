import { HttpContext, PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsService } from "../services/MmsService";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { CmnLocality } from "@adronix/cmn";
import { MmsArea } from "../persistence/entities/MmsArea";
import { Brackets, Like, Repository } from "typeorm";
import { Utils } from "@adronix/server";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { MmsLastTaskInfo } from "../persistence/entities/MmsLastTaskInfo";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";


export const assetsProviders: DataProviderDefinitions = {

    '/listAssets': {
        handler: async function ({ page, limit, sortBy, descending, filter }) {

            const where = filter
                ? { serialNumber: Like(`${filter}%`) }
                : {}

            const [ rows, count ] = await this.service(MmsService).assetRepository
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

            return [PaginatedList(MmsAsset, rows, count)]
        },
        output: [
            [MmsAsset, 'serialNumber', 'client', 'location', 'model'],
            [MmsClient, 'name'],
            [MmsAssetModel, 'name'],
            [MmsClientLocation, 'address', 'locality'],
            [CmnLocality, 'name'],
        ]
    },

    '/editAsset': {
        handler: async function({ id }) {

            this.output.add(MmsClientLocation,
                'displayName', location => `${location.address} - ${location.locality.name}`)

            const asset =
                id
                    ? await this.service(MmsService).assetRepository
                        .findOne({
                            relations: {
                                attributes: true,
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
            [MmsAsset, 'serialNumber', 'client', 'location', 'model', 'area', 'attributes'],
            [MmsClientLocation, 'address', 'locality'],
            [MmsClient, 'name'],
            [MmsAssetAttribute, 'name'],
            [MmsArea, 'name'],
            [MmsAssetModel, 'name'],
            [MmsLastTaskInfo, 'executionDate', 'taskModel', 'asset'],
            [MmsTaskModel, 'name'],
        ]
    }


}

