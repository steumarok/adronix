import { DataProviderDefinitions } from "@adronix/server";
import { TypeORMContext } from "@adronix/typeorm";
import { TcmIngredient, TcmShop } from "../persistence/entities";

export const lookupProviders: DataProviderDefinitions<TypeORMContext> = {

    '/lookupIngredients': {
        handler: async function ({ }) {
            return this.dataSource.getRepository(TcmIngredient)
                .createQueryBuilder()
                .getMany()

        },
        output: [
            [TcmIngredient, 'name']
        ]
    },

    '/lookupShops': {
        handler: async function ({ }) {
            return this.dataSource.getRepository(TcmShop)
                .createQueryBuilder()
                .orderBy('name')
                .getMany()
        },
        output: [
            [TcmShop, 'name']
        ]
    },
}

