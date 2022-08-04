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
import { MmsAreaModel } from "../persistence/entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "../persistence/entities/MmsAreaModelAttribution";


export const areasProviders: DataProviderDefinitions = {

    '/listAreas': {
        handler: async function ({ locationId, page, limit }) {

            const clientLocation = await this.service(MmsService).clientLocationRepository
                    .findOne({ relations: { client: true, locality: true }, where: { id: locationId } })

            const [ rows, count ] = await this.service(MmsService).areaRepository
                .findAndCount({
                    relations: { location: true, modelAttributions: { model: true, area: true } },
                    where: { location: { id: clientLocation.id } },
                    skip: (page - 1) * limit,
                    take: limit
                })

            return [PaginatedList(MmsArea, rows, count)].concat([clientLocation, clientLocation.client])

        },
        output: [
            [MmsArea, 'name', 'location', 'modelAttributions'],
            [MmsClientLocation, 'address', 'locality', 'client'],
            [MmsAreaModelAttribution, 'model', 'area'],
            [MmsAreaModel, 'name'],
            [MmsClient, 'name'],
            [CmnLocality, 'name']
        ]
    },

    '/editArea': {
        handler: async function({ id, clientLocationId }) {

            if (id) {
                const area = await this.service(MmsService).areaRepository
                    .findOne({
                        relations: { location: true },
                        where: { id }})
                const attributions = await this.service(MmsService).areaModelAttributionRepository
                        .find({
                            relations: { area: true, model: true},
                            where: { area }
                        })
                return [area, ...attributions]
            }
            else {
                const l = new MmsArea()
                l.location = await this.service(MmsService).clientLocationRepository
                    .findOneBy({ id: clientLocationId })
                return [l]
            }
        },
        output: [
            [MmsArea, 'name', 'location'],
            [MmsAreaModel, 'name'],
            [MmsAreaModelAttribution, 'model', 'area'],
            [MmsClientLocation, 'address'],
        ]
    },

    '/lookupAreaModels': {
        handler: async function ({ }) {

            return await this.service(MmsService).areaModelRepository
                .find()

        },
        output: [
            [MmsAreaModel, 'name']
        ]
    },

    '/lookupAreas': {
        handler: async function ({ clientLocationId }) {

            return await this.service(MmsService).areaRepository
                .find({
                    where: { location: { id: clientLocationId } } ,
                    order: { name: "asc" }
                })

        },
        output: [
            [MmsArea, 'name']
        ]
    }

}

