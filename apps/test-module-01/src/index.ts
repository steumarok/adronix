import { AsyncRuleExpr, EntityIODefinitions, RulePatterns } from "@adronix/persistence";
import { Application, defineModule, PaginatedList } from "@adronix/server";
import { DataProviderDefintions } from "@adronix/server/src/server/types";
import { ITypeORMAware, TypeORMPersistence } from "@adronix/typeorm";
import { Not } from "typeorm";
import { TcmProductOptionValue, TcmProductOption, TcmIngredient, TcmShop } from "./entities";
import { Service1 } from "./services";
import { Request as JWTRequest } from "express-jwt";
import { VirtualItem } from "@adronix/server/src/server/ItemCollector";

export { TcmIngredient, TcmProductOption, TcmProductOptionValue, TcmShop }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue, TcmShop ]

@VirtualItem
class TcmProductOptionExtra {
    constructor(public productOption: TcmProductOption, public ingredientNames: string[]) {}
}

const providers: DataProviderDefintions<Application & ITypeORMAware> = {

    '/listProductOption': {
        handler: async function ({ page, limit }, items: any[]) {

            console.log((this.context.request as JWTRequest).auth)

            const { rows, count } = await Service1.get(this).listProductOptions(page, limit)

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
                    ? await this.app.getDataSource(this.context).getRepository(TcmProductOption)
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

    '/lookupIngredients': {
        handler: async function ({ }) {

            return this.app.getDataSource(this.context).getRepository(TcmIngredient)
                .createQueryBuilder()
                .getMany()

        },
        output: [
            [TcmIngredient, 'name']
        ]
    },

    '/lookupShops': {
        handler: async function ({ }) {

            return this.app.getDataSource(this.context).getRepository(TcmShop)
                .createQueryBuilder()
                .orderBy('name')
                .getMany()

        },
        output: [
            [TcmShop, 'name']
        ]
    },
}




const checkNameDup: AsyncRuleExpr = async function({ name }, entity: TcmProductOption) {
    const conditions = entity ? { id: Not(entity.id) } : {}
    const po = await (this.manager as ITypeORMAware).getDataSource(this.context).getRepository(TcmProductOption)
        .findOne({ where: { name, ...conditions }})
    return !po
}




const ioDefinitions: EntityIODefinitions = [
    {
        entityClass: TcmProductOption,
        rules: {
            'name': [
                [ RulePatterns.notBlank(),   'empty'],
                [ RulePatterns.minLength(3), 'min length 3' ],
                [ checkNameDup,              { code: 'CHK001', message: 'name not valid' } ]
            ]
        }
    },
    {
        entityClass: TcmIngredient
    },
    {
        entityClass: TcmShop
    }
]



export const Module1 = defineModule()
    .buildPersistence(TypeORMPersistence
        .build()
        .addDefinitions(ioDefinitions)
    )
    .addDataProviders(providers)
    .addServices(Service1)

export { Service1 }