import { CmnMeasurementUnit } from "@adronix/cmn";
import { DataProviderDefinitions, Utils } from "@adronix/server";
import { Metadata } from "@adronix/server/src/server/ItemCollector";
import { Like } from "typeorm";
import { MmsAreaModel } from "../persistence/entities/MmsAreaModel";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { MmsAssetComponentModel } from "../persistence/entities/MmsAssetComponentModel";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsAssetModelPivot } from "../persistence/entities/MmsAssetModelPivot";
import { MmsChecklistItemModel } from "../persistence/entities/MmsChecklistItemModel";
import { MmsChecklistModel } from "../persistence/entities/MmsChecklistModel";
import { MmsPart } from "../persistence/entities/MmsPart";
import { MmsResourceModel } from "../persistence/entities/MmsResourceModel";
import { MmsResourceType } from "../persistence/entities/MmsResourceType";
import { MmsService } from "../persistence/entities/MmsService";
import { MmsTaskAttribute } from "../persistence/entities/MmsTaskAttribute";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";
import { MmsRepoService } from "../services/MmsRepoService";


export const modelsProviders: DataProviderDefinitions = {

    '/listAssetComponentModels': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsRepoService).assetComponentModelRepository
                .find({
                    where,
                    relations: {
                        measurementUnit: true
                    },
                    order: { [sortBy]: Utils.sortDir(descending) }
                })

        },
        output: [
            [MmsAssetComponentModel, 'name', 'measurementUnit', 'unitQuantity'],
            [CmnMeasurementUnit, 'name']
        ]
    },

    '/editAssetComponentModel': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsRepoService).assetComponentModelRepository
                        .findOne({
                            relations: {
                                measurementUnit: true,
                                checklistItemModels: true
                            },
                            where: { id }})
                    : new MmsAssetComponentModel()

            return [po]
        },
        output: [
            [MmsAssetComponentModel, 'name', 'measurementUnit', 'unitQuantity', 'checklistItemModels'],
            [MmsChecklistItemModel, 'text'],
            [CmnMeasurementUnit, 'name']
        ]
    },


    '/listAssetModels': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsRepoService).assetModelRepository
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
            const service = this.service(MmsRepoService)
            const assetModel =
                id  ? await service.assetModelRepository
                        .findOne({
                            relations: {
                                measurementUnit: true,
                                checklistModel: true
                            },
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
            [MmsAssetModel, 'name', 'assetType', 'measurementUnit', 'unitQuantity', 'checklistModel'],
            [MmsAssetModelPivot, 'assetModel', 'areaModel', 'componentModel', 'quantity', 'rowGroup'],
            [MmsAreaModel, 'name'],
            [MmsChecklistModel, 'name'],
            [MmsAssetComponentModel, 'name', 'measurementUnit'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/lookupAssetModels': {
        handler: async function ({ }) {

            return await this.service(MmsRepoService).assetModelRepository
                .find({order: { name: "asc" }})

        },
        output: [
            [MmsAssetModel, 'name', 'assetType']
        ]
    },


    '/lookupAssetComponentModels': {
        handler: async function ({ }) {

            return await this.service(MmsRepoService).assetComponentModelRepository
                .find({
                    relations: { measurementUnit: true },
                    order: { name: "asc" }
                })

        },
        output: [
            [MmsAssetComponentModel, 'name', 'measurementUnit', 'unitQuantity'],
            [CmnMeasurementUnit, 'name'],
        ]
    },


    '/listAreaModels': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsRepoService).areaModelRepository
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
                    ? await this.service(MmsRepoService).areaModelRepository
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

            return await this.service(MmsRepoService).areaModelRepository
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

            return await this.service(MmsRepoService).resourceTypeRepository
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
                    ? await this.service(MmsRepoService).resourceTypeRepository
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

            return await this.service(MmsRepoService).resourceTypeRepository
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

            return await this.service(MmsRepoService).resourceModelRepository
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
                    ? await this.service(MmsRepoService).resourceModelRepository
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

            return await this.service(MmsRepoService).resourceModelRepository
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

            return await this.service(MmsRepoService).partRepository
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
                    ? await this.service(MmsRepoService).partRepository
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

            return await this.service(MmsRepoService).partRepository
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

            return await this.service(MmsRepoService).taskModelRepository
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
                    ? await this.service(MmsRepoService).taskModelRepository
                        .findOne({
                            relations: { resourceModels: true },
                            where: { id }})
                    : new MmsTaskModel()

            return [po]
        },
        output: [
            [MmsTaskModel, 'name', 'resourceModels', 'codeSuffix', 'codePrefix', 'useGlobalCounter'],
            [MmsResourceModel, 'name'],
        ]
    },

	'/lookupTaskModels': {
        handler: async function ({ }) {

            return await this.service(MmsRepoService).taskModelRepository
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

            return await this.service(MmsRepoService).assetAttributeRepository
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
                    ? await this.service(MmsRepoService).assetAttributeRepository
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

            return await this.service(MmsRepoService).assetAttributeRepository
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

            const assetModelCount = await this.service(MmsRepoService).assetModelRepository.count()

            return [new Metadata('assetModelCount', assetModelCount)]
        }
    },


    '/listServices': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsRepoService).serviceRepository
                .find({
                    where,
                    relations: { measurementUnit: true },
                    order: Utils.orderClause(sortBy || 'name', descending)
                })

        },
        output: [
            [MmsService, 'name', 'measurementUnit', 'price'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/editService': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsRepoService).serviceRepository
                        .findOne({
                            relations: { measurementUnit: true },
                            where: { id }})
                    : new MmsService()

            return [po]
        },
        output: [
            [MmsService, 'name', 'measurementUnit', 'price'],
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/lookupServices': {
        handler: async function ({ }) {

            return await this.service(MmsRepoService).serviceRepository
                .find({
                    relations: { measurementUnit: true },
                    order: { name: "asc" }})

        },
        output: [
            [MmsService, 'name', 'measurementUnit'],
            [CmnMeasurementUnit, 'name'],
        ]
    },


    '/listChecklistModels': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsRepoService).checklistModelRepository
                .find({
                    where,
                    relations: {
                        checklistItemModels: true
                    },
                    order: Utils.orderClause(sortBy || 'name', descending)
                })

        },
        output: [
            [MmsChecklistModel, 'name', 'checklistItemModels'],
            [MmsChecklistItemModel, 'text']
        ]
    },

    '/editChecklistModel': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsRepoService).checklistModelRepository
                        .findOne({
                            relations: {
                                checklistItemModels: true
                            },
                            where: { id }})
                    : new MmsChecklistModel()

            return [po]
        },
        output: [
            [MmsChecklistModel, 'name', 'checklistItemModels'],
            [MmsChecklistItemModel, 'text']
        ]
    },

    '/lookupChecklistModels': {
        handler: async function ({ }) {

            return await this.service(MmsRepoService).checklistModelRepository
                .find({
                    relations: { },
                    order: { name: "asc" }})

        },
        output: [
            [MmsChecklistModel, 'name']
        ]
    },


    '/listChecklistItemModels': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { text: Like(`${filter}%`) }
                : {}

            return await this.service(MmsRepoService).checklistItemModelRepository
                .find({
                    where,
                    relations: {
                    },
                    order: Utils.orderClause(sortBy || 'text', descending)
                })

        },
        output: [
            [MmsChecklistItemModel, 'text', 'dataType']
        ]
    },

    '/editChecklistItemModel': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsRepoService).checklistItemModelRepository
                        .findOne({
                            relations: {
                            },
                            where: { id }})
                    : new MmsChecklistItemModel()

            return [po]
        },
        output: [
            [MmsChecklistItemModel, 'text', 'dataType', 'typeOptions']
        ]
    },

    '/lookupChecklistItemModels': {
        handler: async function ({ }) {

            return await this.service(MmsRepoService).checklistItemModelRepository
                .find({
                    relations: { },
                    order: { text: "asc" }})

        },
        output: [
            [MmsChecklistItemModel, 'text']
        ]
    },


    '/lookupTaskAttributes': {
        handler: async function ({ }) {

            return await this.service(MmsRepoService).taskAttributeRepository
                .find({
                    relations: { incompatibleAttributes: true },
                    order: { name: "asc" }
                })

        },
        output: [
            [MmsTaskAttribute, 'name', 'incompatibleAttributes']
        ]
    },
}

