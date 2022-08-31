import { DataProviderDefinitions } from "@adronix/server";
import { MmsRepoService } from "../services/MmsRepoService";
import { CmnMeasurementUnit } from "@adronix/cmn";
import { Utils } from "@adronix/server";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsPart } from "../persistence/entities/MmsPart";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";
import { MmsPartRequirement, MmsQuantityType } from "../persistence/entities/MmsPartRequirement";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { MmsAreaModel } from "../persistence/entities/MmsAreaModel";
import { MmsScheduling } from "../persistence/entities/MmsScheduling";
import { MmsAssetComponentModel } from "../persistence/entities/MmsAssetComponentModel";
import { MmsWorkPlan } from "../persistence/entities/MmsWorkPlan";
import { MmsService } from "../persistence/entities/MmsService";
import { MmsStateAttribute } from "../persistence/entities/MmsStateAttribute";


export const workPlanProviders: DataProviderDefinitions = {

    '/listWorkPlans': {
        handler: async function ({ sortBy, descending }) {

            return await this.service(MmsRepoService).workPlanRepository
                .find({
                    relations: {
                        assetComponentModel: true,
                        assetModel: true,
                        taskModel: true,
                        assetAttributes: true,
                        service: {
                            measurementUnit: true
                        }
                    },
                    order: Utils.orderClause(sortBy, descending)
                })

        },
        output: [
            [MmsWorkPlan, 'taskModel', 'assetModel', 'assetComponentModel',
                'assetAttributes', 'service', 'quantity'],
            [MmsService, 'name', 'measurementUnit'],
            [MmsTaskModel, 'name'],
            [MmsAssetAttribute, 'name'],
            [MmsAssetModel, 'name', 'assetType'],
            [MmsAssetComponentModel, 'name'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/editWorkPlan': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsRepoService).workPlanRepository
                        .findOne({
                            relations: {
                                assetModel: {
                                    measurementUnit: true
                                },
                                taskModel: true,
                                assetAttributes: true,
                                assetComponentModel: {
                                    measurementUnit: true
                                },
                                service: {
                                    measurementUnit: true
                                }
                            },
                            where: { id }})
                    : new MmsWorkPlan({ quantityType: MmsQuantityType.RELATIVE })

            return [po]
        },
        output: [
            [MmsWorkPlan, 'taskModel', 'assetModel', 'assetComponentModel',
                'assetAttributes', 'service', 'quantity', 'quantityType'],
            [MmsAssetModel, 'name', 'measurementUnit', 'assetType'],
            [MmsTaskModel, 'name'],
            [MmsService, 'name', 'measurementUnit'],
            [MmsAssetAttribute, 'name'],
            [MmsAssetComponentModel, 'name', 'measurementUnit', 'unitQuantity'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/listPartRequirements': {
        handler: async function ({ sortBy, descending }) {

            return await this.service(MmsRepoService).partRequirementRepository
                .find({
                    relations: {
                        assetModel: true,
                        taskModel: true,
                        assetComponentModel: true,
                        assetAttributes: true,
                        part: {
                            measurementUnit: true
                        }
                    },
                    order: Utils.orderClause(sortBy, descending)
                })

        },
        output: [
            [MmsPartRequirement, 'taskModel', 'assetModel', 'assetComponentModel',
                'assetAttributes', 'part', 'quantity'],
            [MmsTaskModel, 'name'],
            [MmsPart, 'name', 'measurementUnit'],
            [MmsAssetAttribute, 'name'],
            [MmsAssetModel, 'name', 'assetType'],
            [MmsAssetComponentModel, 'name'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/editPartRequirement': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsRepoService).partRequirementRepository
                        .findOne({
                            relations: {
                                assetModel: {
                                    measurementUnit: true
                                },
                                taskModel: true,
                                assetAttributes: true,
                                assetComponentModel: {
                                    measurementUnit: true
                                },
                                part: {
                                    measurementUnit: true
                                }
                            },
                            where: { id }})
                    : new MmsPartRequirement({ quantityType: MmsQuantityType.RELATIVE })

            return [po]
        },
        output: [
            [MmsPartRequirement, 'taskModel', 'assetModel', 'assetComponentModel',
                'assetAttributes', 'part', 'quantity', 'quantityType'],
            [MmsAssetModel, 'name', 'measurementUnit', 'assetType'],
            [MmsTaskModel, 'name'],
            [MmsPart, 'name', 'measurementUnit'],
            [MmsAssetAttribute, 'name'],
            [MmsAssetComponentModel, 'name', 'measurementUnit', 'unitQuantity'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/listSchedulings': {
        handler: async function ({ sortBy, descending }) {

            return await this.service(MmsRepoService).schedulingRepository
                .find({
                    relations: {
                        areaModels: true,
                        assetAttributes: true,
                        assetModels: true,
                        taskModel: true,
                        startFromLasts: true
                    },
                    order: Utils.orderClause(sortBy, descending)
                })

        },
        output: [
            [MmsScheduling, 'taskModel', 'areaModels', 'assetAttributes', 'assetModels', 'startFromLasts',
                'dayMonthFrom', 'dayMonthTo', 'every', 'unit'],
            [MmsTaskModel, 'name'],
            [MmsAreaModel, 'name'],
            [MmsAssetAttribute, 'name'],
        ]
    },

    '/editScheduling': {
        handler: async function({ id }) {
            const po =
                id  ? await this.service(MmsRepoService).schedulingRepository
                        .findOne({
                            relations: {
                                areaModels: true,
                                assetAttributes: true,
                                assetModels: true,
                                taskModel: true,
                                startFromLasts: true,
                                assignedAttributes: true,
                                lastsStateAttributes: true
                            },
                            where: { id }})
                    : new MmsScheduling()

            return [po]
        },
        output: [
            [MmsScheduling, 'taskModel', 'areaModels', 'assetAttributes',
                'assetModels', 'startFromLasts', 'dayMonthFrom', 'dayMonthTo',
                'every', 'unit', 'startImmediately', 'startTime', 'daysOfWeek',
                'assignedAttributes', 'lastsStateAttributes'],
            [MmsTaskModel, 'name'],
            [MmsAreaModel, 'name'],
            [MmsAssetModel, 'name'],
            [MmsAssetAttribute, 'name'],
            [MmsStateAttribute, 'name'],
        ]
    },
}

