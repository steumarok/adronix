import { PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsService } from "../services/MmsService";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { CmnLocality } from "@adronix/cmn";
import { MmsArea } from "../persistence/entities/MmsArea";
import { Like } from "typeorm";

class Utils {
    static toBool(str: string): boolean {
        return str == 'true'
    }
}

export const clientsProviders: DataProviderDefinitions = {

    '/listClients': {
        handler: async function ({ page, limit, sortBy, descending, filter }) {

            const [ rows, count ] = await this.service(MmsService).clientRepository
                .findAndCount({
                    where: filter ? { name: Like(`${filter}%`) } : {},
                    skip: (page - 1) * limit,
                    take: limit,
                    order: { [sortBy || 'name']: Utils.toBool(descending) ? "desc": "asc" }
                })

            return [PaginatedList(MmsClient, rows, count)]

        },
        output: [
            [MmsClient, 'name']
        ]
    },

    '/editClient': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.service(MmsService).clientRepository
                        .findOne({
                            relations: { },
                            where: { id }})
                    : new MmsClient()

            return [po]
        },
        output: [
            [MmsClient, 'name']
        ]
    },


    '/listClientLocations': {
        handler: async function ({ clientId, page, limit }) {

            const client = await this.service(MmsService).clientRepository
                    .findOneBy({ id: clientId })

            const [ rows, count ] = await this.service(MmsService).clientLocationRepository
                .findAndCount({
                    relations: { locality: true, client: true },
                    where: { client: { id: client.id} },
                    skip: (page - 1) * limit,
                    take: limit
                })

            return [PaginatedList(MmsClientLocation, rows, count)].concat([client])

        },
        output: [
            [MmsClientLocation, 'address', 'locality', 'client'],
            [MmsClient, 'name'],
            [CmnLocality, 'name']
        ]
    },

    '/editClientLocation': {
        handler: async function({ id, clientId }) {

            if (id) {
                const l = await this.service(MmsService).clientLocationRepository
                    .findOne({
                        relations: { client: true, locality: true },
                        where: { id }})
                return [l]
            }
            else {
                const l = new MmsClientLocation()
                l.client = await this.service(MmsService).clientRepository
                    .findOneBy({ id: clientId })
                return [l]
            }
        },
        output: [
            [MmsClientLocation, 'address', 'client', 'locality'],
            [MmsClient, 'name'],
            [CmnLocality, 'name']
        ]
    },


    '/listAreas': {
        handler: async function ({ locationId, page, limit }) {

            const clientLocation = await this.service(MmsService).clientLocationRepository
                    .findOne({ relations: { client: true, locality: true }, where: { id: locationId } })

            const [ rows, count ] = await this.service(MmsService).areaRepository
                .findAndCount({
                    relations: { location: true },
                    where: { location: { id: clientLocation.id } },
                    skip: (page - 1) * limit,
                    take: limit
                })

            return [PaginatedList(MmsArea, rows, count)].concat([clientLocation, clientLocation.client])

        },
        output: [
            [MmsArea, 'name', 'location'],
            [MmsClientLocation, 'address', 'locality', 'client'],
            [MmsClient, 'name'],
            [CmnLocality, 'name']
        ]
    },
}

