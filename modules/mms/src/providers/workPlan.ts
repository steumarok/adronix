import { HttpContext, PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsService } from "../services/MmsService";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { CmnLocality, CmnMeasurementUnit } from "@adronix/cmn";
import { MmsArea } from "../persistence/entities/MmsArea";
import { Brackets, ConnectionIsNotSetError, Like, Repository } from "typeorm";
import { EntityClass } from "@adronix/persistence/src";
import { ReturnType } from "@adronix/server";
import { Utils } from "@adronix/server";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { Metadata } from "@adronix/server/src/server/ItemCollector";
import { MmsResourceType } from "../persistence/entities/MmsResourceType";
import { MmsResourceModel } from "../persistence/entities/MmsResourceModel";
import { MmsPart } from "../persistence/entities/MmsPart";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";
import { MmsPartRequirement } from "../persistence/entities/MmsPartRequirement";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { config } from "process";
import { MmsAreaModel } from "../persistence/entities/MmsAreaModel";
import { MmsScheduling } from "../persistence/entities/MmsScheduling";
import { MmsAssetComponentModel } from "../persistence/entities/MmsAssetComponentModel";


export const workPlanProviders: DataProviderDefinitions = {

    '/listPartRequirements': {
        handler: async function ({ sortBy, descending }) {

            return await this.service(MmsService).partRequirementRepository
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
            [MmsPartRequirement, 'taskModel', 'assetModel', 'assetComponentModel', 'assetAttributes', 'part', 'quantity'],
            [MmsPart, 'name'],
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
                    ? await this.service(MmsService).partRequirementRepository
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
                    : new MmsPartRequirement()

            return [po]
        },
        output: [
            [MmsPartRequirement, 'taskModel', 'assetModel', 'assetComponentModel', 'assetAttributes', 'part', 'quantity'],
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

            return await this.service(MmsService).schedulingRepository
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
                id  ? await this.service(MmsService).schedulingRepository
                        .findOne({
                            relations: {
                                areaModels: true,
                                assetAttributes: true,
                                assetModels: true,
                                taskModel: true,
                                startFromLasts: true
                            },
                            where: { id }})
                    : new MmsScheduling()

            return [po]
        },
        output: [
            [MmsScheduling, 'taskModel', 'areaModels', 'assetAttributes',
                'assetModels', 'startFromLasts', 'dayMonthFrom', 'dayMonthTo',
                'every', 'unit'],
            [MmsTaskModel, 'name'],
            [MmsAreaModel, 'name'],
            [MmsAssetModel, 'name'],
            [MmsAssetAttribute, 'name'],
        ]
    },
}

