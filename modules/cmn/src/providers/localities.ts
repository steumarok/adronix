import { PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { Like } from "typeorm";
import { CmnLocality } from "../persistence/entities/CmnLocality";
import { CmnService } from "../services/CmnService";

export const localitiesProviders: DataProviderDefinitions = {

    '/lookupLocalities': {
        handler: async function ({ search }) {

            if (!search || search.length < 3) {
                return []
            }

            return await this.service(CmnService).localityRepository
                .find({ where: { name: Like(`${search}%`) } })

        },
        output: [
            [CmnLocality, 'name']
        ]
    }

}