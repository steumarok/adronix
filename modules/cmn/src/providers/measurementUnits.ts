import { PaginatedList, Utils } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { Like } from "typeorm";
import { CmnLocality } from "../persistence/entities/CmnLocality";
import { CmnMeasurementUnit } from "../persistence/entities/CmnMeasurementUnit";
import { CmnService } from "../services/CmnService";

export const measurementUnitsProviders: DataProviderDefinitions = {

    '/listMeasurementUnits': {
        handler: async function ({ sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            return await this.service(CmnService).measurementUnitRepository
                .find({
                    where,
                    relations: { },
                    order: { [sortBy]: Utils.sortDir(descending) }
                })

        },
        output: [
            [CmnMeasurementUnit, 'name'],
        ]
    },

    '/editMeasurementUnit': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(CmnService).measurementUnitRepository
                        .findOne({
                            relations: { },
                            where: { id }})
                    : new CmnMeasurementUnit()

            return [po]
        },
        output: [
            [CmnMeasurementUnit, 'name'],
        ]
    },

	'/lookupMeasurementUnits': {
        handler: async function ({ }) {

            return await this.service(CmnService).measurementUnitRepository
                .find({order: { name: "asc" }})

        },
        output: [
            [CmnMeasurementUnit, 'name']
        ]
    },


}