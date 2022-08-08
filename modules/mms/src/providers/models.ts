import { HttpContext, PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsService } from "../services/MmsService";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { CmnLocality, CmnMeasurementUnit } from "@adronix/cmn";
import { MmsArea } from "../persistence/entities/MmsArea";
import { Brackets, Like, Repository } from "typeorm";
import { EntityClass } from "@adronix/persistence/src";
import { ReturnType } from "@adronix/server";
import { Utils } from "@adronix/server";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { Metadata } from "@adronix/server/src/server/ItemCollector";
import { MmsResourceType } from "../persistence/entities/MmsResourceType";
import { MmsResourceModel } from "../persistence/entities/MmsResourceModel";
import { MmsPart } from "../persistence/entities/MmsPart";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { MmsAreaModel } from "../persistence/entities/MmsAreaModel";
import { MmsAssetModelPivot } from "../persistence/entities/MmsAssetModelPivot";
import { MmsAssetComponentModel } from "../persistence/entities/MmsAssetComponentModel";


export const modelsProviders: DataProviderDefinitions = {

    '/listAssetModels': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsService).assetModelRepository
                .find({
                    where,
                    order: { [sortBy]: Utils.sortDir(descending) }
                })

        },
        output: [
            [MmsAssetModel, 'name']
        ]
    },

    '/editAssetModel': {
        handler: async function({ id }) {
            const service = this.service(MmsService)
            const assetModel =
                id  ? await service.assetModelRepository
                        .findOne({
                            relations: { },
                            where: { id }})
                    : new MmsAssetModel()

            const pivots =
                id  ? await service.assetModelPivotRepository
                        .find({
                            where: { assetModel },
                            relations: {
                                areaModel: true,
                                assetModel: true,
                                componentModel: {
                                    measurementUnit: true} }
                        })
                    : []

            return [assetModel, ...pivots]
        },
        output: [
            [MmsAssetModel, 'name'],
            [MmsAssetModelPivot, 'assetModel', 'areaModel', 'componentModel', 'quantity', 'rowGroup'],
            [MmsAreaModel, 'name'],
            [MmsAssetComponentModel, 'name', 'measurementUnit'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/lookupAssetModels': {
        handler: async function ({ }) {

            return await this.service(MmsService).assetModelRepository
                .find({order: { name: "asc" }})

        },
        output: [
            [MmsAssetModel, 'name']
        ]
    },


    '/lookupAssetComponentModels': {
        handler: async function ({ }) {

            return await this.service(MmsService).assetComponentModelRepository
                .find({
                    relations: { measurementUnit: true },
                    order: { name: "asc" }
                })

        },
        output: [
            [MmsAssetComponentModel, 'name', 'measurementUnit'],
            [CmnMeasurementUnit, 'name'],
        ]
    },


    '/listAreaModels': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsService).areaModelRepository
                .find({
                    where,
                    order: { [sortBy]: Utils.sortDir(descending) }
                })

        },
        output: [
            [MmsAreaModel, 'name']
        ]
    },

    '/editAreaModel': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsService).areaModelRepository
                        .findOne({
                            relations: { },
                            where: { id }})
                    : new MmsAreaModel()

            return [po]
        },
        output: [
            [MmsAreaModel, 'name']
        ]
    },

    '/lookupAreaModels': {
        handler: async function ({ }) {

            return await this.service(MmsService).areaModelRepository
                .find({order: { name: "asc" }})

        },
        output: [
            [MmsAreaModel, 'name']
        ]
    },


    '/listResourceTypes': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsService).resourceTypeRepository
                .find({
                    where,
                    order: { [sortBy]: Utils.sortDir(descending) }
                })

        },
        output: [
            [MmsResourceType, 'name']
        ]
    },

    '/editResourceType': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsService).resourceTypeRepository
                        .findOne({
                            relations: { },
                            where: { id }})
                    : new MmsResourceType()

            return [po]
        },
        output: [
            [MmsResourceType, 'name']
        ]
    },

    '/lookupResourceTypes': {
        handler: async function ({ }) {

            return await this.service(MmsService).resourceTypeRepository
                .find({order: { name: "asc" }})

        },
        output: [
            [MmsResourceType, 'name']
        ]
    },


    '/listResourceModels': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsService).resourceModelRepository
                .find({
                    where,
                    relations: { resourceType: true },
                    order: { [sortBy]: Utils.sortDir(descending) }
                })

        },
        output: [
            [MmsResourceModel, 'name', 'resourceType'],
            [MmsResourceType, 'name'],
        ]
    },

    '/editResourceModel': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsService).resourceModelRepository
                        .findOne({
                            relations: { resourceType: true },
                            where: { id }})
                    : new MmsResourceModel()

            return [po]
        },
        output: [
            [MmsResourceModel, 'name', 'resourceType'],
            [MmsResourceType, 'name'],
        ]
    },

    '/lookupResourceModels': {
        handler: async function ({ }) {

            return await this.service(MmsService).resourceModelRepository
                .find({order: { name: "asc" }})

        },
        output: [
            [MmsResourceModel, 'name']
        ]
    },


    '/listParts': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsService).partRepository
                .find({
                    where,
                    relations: { measurementUnit: true },
                    order: { [sortBy]: Utils.sortDir(descending) }
                })

        },
        output: [
            [MmsPart, 'name', 'measurementUnit', 'unitPrice'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/editPart': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsService).partRepository
                        .findOne({
                            relations: { measurementUnit: true },
                            where: { id }})
                    : new MmsPart()

            return [po]
        },
        output: [
            [MmsPart, 'name', 'measurementUnit', 'unitPrice'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

	'/lookupParts': {
        handler: async function ({ }) {

            return await this.service(MmsService).partRepository
                .find({
                    relations: { measurementUnit: true },
                    order: { name: "asc" }})

        },
        output: [
            [MmsPart, 'name', 'measurementUnit'],
            [CmnMeasurementUnit, 'name'],
        ]
    },


    '/listTaskModels': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsService).taskModelRepository
                .find({
                    where,
                    relations: { resourceModels: true },
                    order: Utils.orderClause(sortBy || 'name', descending)
                })

        },
        output: [
            [MmsTaskModel, 'name', 'resourceModels'],
            [MmsResourceModel, 'name'],
        ]
    },

    '/editTaskModel': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsService).taskModelRepository
                        .findOne({
                            relations: { resourceModels: true },
                            where: { id }})
                    : new MmsTaskModel()

            return [po]
        },
        output: [
            [MmsTaskModel, 'name', 'resourceModels'],
            [MmsResourceModel, 'name'],
        ]
    },

	'/lookupTaskModels': {
        handler: async function ({ }) {

            return await this.service(MmsService).taskModelRepository
                .find({order: { name: "asc" }})

        },
        output: [
            [MmsTaskModel, 'name']
        ]
    },



    '/listAssetAttributes': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsService).assetAttributeRepository
                .find({
                    where,
                    relations: { incompatibleAttributes: true },
                    order: { [sortBy]: Utils.sortDir(descending) }
                })

        },
        output: [
            [MmsAssetAttribute, 'name', 'incompatibleAttributes']
        ]
    },

    '/editAssetAttribute': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsService).assetAttributeRepository
                        .findOne({
                            relations: { incompatibleAttributes: true },
                            where: { id }})
                    : new MmsAssetAttribute()

            return [po]
        },
        output: [
            [MmsAssetAttribute, 'name', 'incompatibleAttributes']
        ]
    },

    '/lookupAssetAttributes': {
        handler: async function ({ }) {

            return await this.service(MmsService).assetAttributeRepository
                .find({
                    relations: { incompatibleAttributes: true },
                    order: { name: "asc" }
                })

        },
        output: [
            [MmsAssetAttribute, 'name', 'incompatibleAttributes']
        ]
    },


    '/modelCounts': {
        handler: async function ({ }) {

            const assetModelCount = await this.service(MmsService).assetModelRepository.count()

            return [new Metadata('assetModelCount', assetModelCount)]
        }
    }


}

