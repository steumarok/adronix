import { HttpContext, PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsService } from "../services/MmsService";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { CmnLocality } from "@adronix/cmn";
import { MmsArea } from "../persistence/entities/MmsArea";
import { Like, Repository } from "typeorm";
import { EntityClass } from "@adronix/persistence/src";
import { ReturnType } from "@adronix/server";

class Utils {
    static toBool(str: string): boolean {
        return str == 'true'
    }

    static toInt(str: string): number {
        return Number.parseInt(str)
    }

    static async tableHandler<T>(
        entityClass: EntityClass<T>,
        repository: Repository<unknown>,
        { page, limit, sortBy, descending, filter }: Partial<TableParams>,
        searchFields: string[] = []): Promise<ReturnType> {
        const where = searchFields.length > 0 && filter
            ? { [searchFields[0]]: Like(`${filter}%`) }
            : undefined
        const [ rows, count ] = await repository.findAndCount({
                where,
                skip: (page != undefined) ? (Utils.toInt(page) - 1) * Utils.toInt(limit) : undefined,
                take: (page != undefined) ? Utils.toInt(limit) : undefined,
                order: { [sortBy]: Utils.toBool(descending) ? "desc": "asc" }
            })

        return (page != undefined) ? [PaginatedList(entityClass, rows, count)] : rows
    }
}

type TableParams = {
    page: string,
    limit: string,
    sortBy: string,
    descending: string,
    filter: string
}



export const clientsProviders: DataProviderDefinitions = {

    '/listClients': {
        handler: async function ({ page, limit, sortBy, descending, filter }) {

            const where = filter
                ? { name: Like(`${filter}%`) }
                : {}

            const [ rows, count ] = await this.service(MmsService).clientRepository
                .createQueryBuilder('a')
                .loadRelationCountAndMap('a.locationCount', 'a.locations')
                .where(where)
                .skip((Utils.toInt(page) - 1) * Utils.toInt(limit))
                .take(Utils.toInt(limit))
                .getManyAndCount()

            return [PaginatedList(MmsClient, rows, count)]
        },
        output: [
            [MmsClient, 'name', 'locationCount']
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
        handler: async function ({ clientId, page, limit, sortBy, descending }) {

            const client = await this.service(MmsService).clientRepository
                    .findOneBy({ id: Utils.toInt(clientId) })

            const [ rows, count ] = await this.service(MmsService).clientLocationRepository
                .findAndCount({
                    relations: { locality: true, client: true },
                    where: { client: { id: client.id} },
                    //skip: (page - 1) * limit,
                    //take: limit
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
    }



}

