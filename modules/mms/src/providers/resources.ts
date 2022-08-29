import { HttpContext, PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsRepoService } from "../services/MmsRepoService";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { CmnLocality, CmnMeasurementUnit } from "@adronix/cmn";
import { Brackets, Like, Repository } from "typeorm";
import { Utils } from "@adronix/server";
import { MmsResourceModel } from "../persistence/entities/MmsResourceModel";
import { MmsResource } from "../persistence/entities/MmsResource";


export const resourcesProviders: DataProviderDefinitions = {

    '/listResources': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(MmsRepoService).resourceRepository
                .find({
                    where,
                    relations: { models: true },
                    order: { [sortBy]: Utils.sortDir(descending) }
                })

        },
        output: [
            [MmsResource, 'name', 'models'],
            [MmsResourceModel, 'name']
        ]
    },

    '/editResource': {
        handler: async function({ id }) {
            const r =
                id
                    ? await this.service(MmsRepoService).resourceRepository
                        .findOne({
                            relations: { models: true },
                            where: { id }})
                    : new MmsResource()

            return [r]
        },
        output: [
            [MmsResource, 'name', 'models'],
            [MmsResourceModel, 'name']
        ]
    },

    '/lookupResources': {
        handler: async function ({ }) {

            return await this.service(MmsRepoService).resourceRepository
                .find({
                    order: { name: "asc" }
                })

        },
        output: [
            [MmsResource, 'name']
        ]
    },

}

