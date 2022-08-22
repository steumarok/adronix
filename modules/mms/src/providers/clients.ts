import { HttpContext, PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { MmsService } from "../services/MmsService";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { CmnLocality } from "@adronix/cmn";
import { MmsArea } from "../persistence/entities/MmsArea";
import { Brackets, Like, Repository } from "typeorm";
import { EntityClass } from "@adronix/persistence/src";
import { ReturnType } from "@adronix/server";
import { Utils } from "@adronix/server";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { TypeORMTransaction } from "@adronix/typeorm/src";
import { isAsyncFunction } from "util/types";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";

function transactional(iterator: () => Generator<any, void, unknown>) {
    console.log(this)
    return async function(t: TypeORMTransaction) {
        const it = iterator()
        var prev = null
        while (true) {
            const n = it.next(prev)
            prev = await n.value(t)
            console.log(prev)
            if (n.done) {
                break;
            }
        }
    }.bind(this)
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
                /*.addSelect(qb => qb.subQuery()
                    .select('count(1)', 'cnt')
                    .from(MmsClientLocation, 'l')
                    .where('l.client.id=a.id'), 'locationCount')*/
                .where(where)
                .skip((Utils.toInt(page) - 1) * Utils.toInt(limit))
                .take(Utils.toInt(limit))
                .orderBy(sortBy, Utils.toBool(descending) ? "DESC": "ASC")
                .getManyAndCount();

            //this.output.add(MmsClient, 'locationCount', (client) => client.id)

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
        sync: {
            /*onBeforeInsert: [
                [
                    MmsClientLocation,
                    async function (changes) {
                        console.log(this)
                        return function*() {
                            const model = yield changes.assetModel
                            console.log(model)
                        }
                    }
                ]
            ],*/
            onAfterInsert: [
                [
                    MmsClientLocation,
                    function* (changes, location: MmsClientLocation) {
                        console.log(changes)
                        if (changes.createAsset) {
                            const model = (yield changes.assetModel) as MmsAssetModel
                            const g = yield* this.service(MmsService).createCompositeAsset(location, model)

                            console.log(g)
                            //throw new Error("88")
                        }
                    }
                ]
            ],/*
            onBeforeUpdate: [
                [
                    MmsClientLocation,
                    async (changes, location: MmsClientLocation) => async (t) => {
                        console.log(`before update ${location.address}`)
                    }
                ]
            ],
            onAfterUpdate: [
                [
                    MmsClientLocation,
                    async (changes, location: MmsClientLocation) => async (t) => {
                        console.log(`after update ${location.address}`)
                    }
                ]
            ],*/
        },
        output: [
            [MmsClientLocation, 'address', 'client', 'locality'],
            [MmsClient, 'name'],
            [MmsAsset, 'name', 'location', 'client', 'assetType'],
            [CmnLocality, 'name']
        ]
    },

    '/lookupClients': {
        handler: async function ({ search }) {

            if (!search) {
                return []
            }

            return await this.service(MmsService).clientRepository
                .find({
                    where: { name: Like(`${search}%`) } ,
                    order: { name: "asc" }
                })

        },
        output: [
            [MmsClient, 'name']
        ]
    },

    '/lookupClientLocations': {
        handler: async function ({ clientId }) {

            this.output.add(MmsClientLocation, 'displayName', location => `${location.address} - ${location.locality.name}`)

            return await this.service(MmsService).clientLocationRepository
                .find({
                    relations: { locality: true },
                    where: { client: { id: clientId } } ,
                    order: { address: "asc" }
                })

        },
        output: [
            [MmsClientLocation, 'displayName']
        ]
    }



}

