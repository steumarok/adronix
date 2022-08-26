import { HttpContext, PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsRepoService } from "../services/MmsRepoService";
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
import { MmsTask } from "../persistence/entities/MmsTask";
import { MmsTaskService } from "../services/MmsTaskService";
import { MmsServiceProvision } from "../persistence/entities/MmsServiceProvision";
import { MmsService } from "../persistence/entities/MmsService";
import { MmsWorkPlan } from "../persistence/entities/MmsWorkPlan";


export const tasksProviders: DataProviderDefinitions = {

    '/listTasks': {
        handler: async function ({ page, limit, sortBy, descending, filter, clientId, clientLocationId }) {

            const service = this.service(MmsRepoService)

            const where = {
                ...Utils.where(filter, { code: Like(`${filter}%`) }),
                ...Utils.where(clientId, { client: { id: clientId } }),
                ...Utils.where(clientLocationId, { location: { id: clientLocationId } })
            }

            const [ rows, count ] = await service.taskRepository
                .createQueryBuilder('a')
                .leftJoinAndSelect('a.model', 'taskModel')
                .leftJoinAndSelect('a.asset', 'asset')
                .leftJoinAndSelect('asset.client', 'client')
                .leftJoinAndSelect('asset.model', 'assetModel')
                .leftJoinAndSelect('asset.location', 'location')
                .leftJoinAndSelect('location.locality', 'locality')
                .where(where)
                .skip((Utils.toInt(page) - 1) * Utils.toInt(limit))
                .take(Utils.toInt(limit))
                .orderBy('a.' + sortBy, Utils.toBool(descending) ? "DESC": "ASC")
                .getManyAndCount();

            const results = [PaginatedList(MmsTask, rows, count)]

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
            [MmsTask, 'code', 'model', 'asset', 'codePrefix', 'codeSuffix',
                'scheduledDate', 'executionDate'],
            [MmsTaskModel, 'name'],
            [MmsAsset, 'name', 'client', 'location', 'model'],
            [MmsClient, 'name'],
            [MmsAssetModel, 'name', 'assetType'],
            [MmsClientLocation, 'address', 'locality'],
            [CmnLocality, 'name'],
        ]
    },

    '/editTask': {
        handler: async function({ id }) {

            const task =
                id
                    ? await this.service(MmsRepoService).taskRepository
                        .findOne({
                            relations: {
                                model: true,
                                asset: true
                            },
                            where: { id }})
                    : new MmsTask()

            const result: any[] = [task]

            if (id) {
                const serviceProvisions = await this.service(MmsRepoService).serviceProvisionRepository
                    .find({
                        relations: {
                            service: {
                                measurementUnit: true
                            },
                            workPlan: {
                                assetComponentModel: true,
                                assetModel: true
                            }
                        },
                        where: { task: { id } }
                    })

                serviceProvisions.forEach(sp => result.push(sp))
            }

            return result
        },
        output: [
            [MmsTask, 'asset', 'model', 'codePrefix', 'codeSuffix', 'scheduledDate',
                'executionDate', 'code'],
            [MmsAsset, 'name', 'client', 'location', 'model', 'area', 'attributes'],
            [MmsClientLocation, 'address', 'locality'],
            [MmsClient, 'name'],
            [MmsAssetModel, 'name'],
            [MmsAssetComponentModel, 'name'],
            [MmsTaskModel, 'name'],
            [CmnMeasurementUnit, 'name'],
            [MmsService, 'name', 'measurementUnit'],
            [MmsWorkPlan, 'assetComponentModel', 'assetModel'],
            [MmsServiceProvision, 'task', 'service', 'expectedQuantity', 'workPlan'],
        ]
    }
}

