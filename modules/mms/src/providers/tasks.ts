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
import { MmsTask } from "../persistence/entities/MmsTask";
import { MmsTaskService } from "../services/MmsTaskService";
import { MmsServiceProvision } from "../persistence/entities/MmsServiceProvision";
import { MmsService } from "../persistence/entities/MmsService";
import { MmsWorkPlan } from "../persistence/entities/MmsWorkPlan";
import { MmsResource } from "../persistence/entities/MmsResource";
import { MmsWorkOrder } from "../persistence/entities/MmsWorkOrder";
import { MmsTaskAttribute } from "../persistence/entities/MmsTaskAttribute";


export const tasksProviders: DataProviderDefinitions = {

    '/listWorkOrders': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { code: Like(`${filter}%`) }
                : {}

            const workOrders = await this.service(MmsRepoService).workOrderRepository
                .find({
                    where,
                    relations: {
                        client: true,
                        location: {
                            locality: true
                        }
                    },
                    order: Utils.orderClause(sortBy || 'code', descending)
                })

            const tasks = await this.service(MmsRepoService).taskRepository
                .find({
                    where: {
                        workOrder: { id: In(workOrders.map(wo => wo.id)) }
                    },
                    relations: {
                        asset: {
                            model: true
                        },
                        workOrder: true
                    }
                })

            this.output.add(MmsAsset, 'workOrders', asset => {
                return tasks.filter(t => t.asset.id == asset.id).map(t => t.workOrder)
            })

            const assets = new Set(tasks.map(t => t.asset))

            return [...workOrders, ...assets]
        },
        output: [
            [MmsWorkOrder, 'code', 'client', 'location'],
            [MmsClient, 'name'],
            [MmsAsset, 'name', 'model'],
            [MmsAssetModel, 'name'],
            [MmsClientLocation, 'address', 'locality'],
            [CmnLocality, 'name'],
        ]
    },

    '/editWorkOrder': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsRepoService).workOrderRepository
                        .findOne({
                            relations: {
                                client: true,
                                location: {
                                    locality: true
                                }
                            },
                            where: { id }})
                    : new MmsWorkOrder()

            return [po]
        },
        output: [
            [MmsWorkOrder, 'code', 'client', 'location'],
            [MmsClient, 'name'],
            [MmsClientLocation, 'address', 'locality'],
            [CmnLocality, 'name'],
        ]
    },


    '/listTasks': {
        handler: async function ({
            page,
            limit,
            sortBy,
            descending,
            filter,
            workOrderId,
            clientId,
            clientLocationId,
            odlTaskId }) {

            const service = this.service(MmsRepoService)

            async function buildOdlTaskIdWhere() {
                if (odlTaskId) {
                    const task = await service.taskRepository.findOne({
                        relations: {
                            asset: {
                                location: true
                            }
                        },
                        where: {
                            id: odlTaskId
                        },
                    })
                    return {
                        asset: {
                            location: {
                                id: task.asset.location.id
                            }
                        }
                    }
                }
                else {
                    return {}
                }
            }

            const where = {
                ...Utils.where(filter, { code: Like(`${filter}%`) }),
                ...Utils.where(workOrderId, { workOrder: { id: workOrderId } }),
                ...Utils.where(clientId, { client: { id: clientId } }),
                ...Utils.where(clientLocationId, { location: { id: clientLocationId } }),
                ...await buildOdlTaskIdWhere()
            }

            const [ rows, count ] = await service.taskRepository
                .createQueryBuilder('a')
                .leftJoinAndSelect('a.model', 'taskModel')
                .leftJoinAndSelect('a.asset', 'asset')
                .leftJoinAndSelect('a.workOrder', 'workOrder')
                .leftJoinAndSelect('a.attributes', 'attributes')
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
                'scheduledDate', 'executionDate', 'workOrder', 'attributes'],
            [MmsTaskModel, 'name'],
            [MmsAsset, 'name', 'client', 'location', 'model'],
            [MmsWorkOrder, 'code'],
            [MmsClient, 'name'],
            [MmsTaskAttribute, 'name'],
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
                                asset: true,
                                resources: true,
                                workOrder: true,
                                attributes: true
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
                            },
                            assetComponentModel: true
                        },
                        where: { task: { id } }
                    })

                serviceProvisions.forEach(sp => result.push(sp))
            }

            return result
        },
        output: [
            [MmsTask, 'asset', 'model', 'codePrefix', 'codeSuffix', 'scheduledDate',
                'executionDate', 'code', 'resources', 'workOrder', 'attributes'],
            [MmsAsset, 'name', 'client', 'location', 'model', 'area', 'attributes'],
            [MmsClientLocation, 'address', 'locality'],
            [MmsClient, 'name'],
            [MmsWorkOrder, 'code'],
            [MmsAssetModel, 'name'],
            [MmsResource, 'name'],
            [MmsAssetComponentModel, 'name'],
            [MmsTaskModel, 'name'],
            [MmsTaskAttribute, 'name'],
            [CmnMeasurementUnit, 'name'],
            [MmsService, 'name', 'measurementUnit'],
            [MmsWorkPlan, 'assetComponentModel', 'assetModel'],
            [MmsServiceProvision, 'task', 'service', 'expectedQuantity', 'workPlan',
                'removed', 'actualQuantity', 'assetComponentModel'],
        ]
    }
}

