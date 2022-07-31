import { PaginatedList } from "@adronix/server";
import { DataProviderDefinitions } from "@adronix/server";
import { TypeORMContext } from "@adronix/typeorm";
import { TcmIngredient, TcmProductOption, TcmShop } from "../persistence/entities";
import { Service1 } from "../services";
import { Request as JWTRequest } from "express-jwt";
import { VirtualItem } from "@adronix/server";

@VirtualItem
class TcmProductOptionExtra {
    constructor(
        public productOption: TcmProductOption,
        public ingredientNames: string[]) {}
}

export const productOptionProviders: DataProviderDefinitions<TypeORMContext> = {

    '/listProductOption': {
        handler: async function ({ page, limit }, items: any[]) {

            console.log((this.request as JWTRequest).auth)

            const { rows, count } = await this.service(Service1).listProductOptions(page, limit)

            return [PaginatedList(TcmProductOption, rows, count)]
                .concat(rows.map(r => r.shop))
                .concat(rows.map(r => new TcmProductOptionExtra(r, r.ingredients.map(i => i.name))))
        },
        output: [
            [TcmProductOption, 'name', 'quantity', 'shop'],
            [TcmShop, 'name'],
            [TcmProductOptionExtra, 'productOption', 'ingredientNames']

        ]
    },

    '/editProductOption': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.dataSource.getRepository(TcmProductOption)
                        .findOne({
                            relations: { ingredients: true, shop: true },
                            where: { id }})
                    : new TcmProductOption()

            return [po]
        },
        output: [
            [TcmProductOption, 'name', 'ingredients', 'shop', 'quantity'],
            [TcmShop, 'name'],
            [TcmIngredient, 'name', 'price']
        ]
    },

}

