import { AsyncRuleExpr, EntityIODefinitions, IPersistenceManager } from "@adronix/persistence";
import { Application, defineModule, Module, PaginatedList, ServiceContext } from "@adronix/server";
import { DataProviderDefintions } from "@adronix/server/src/server/types";
import { ITypeORMAware, TypeORMPersistence } from "@adronix/typeorm";
import { Not } from "typeorm";
import { TcmProductOptionValue, TcmProductOption, TcmIngredient, TcmShop } from "./entities";
import { Service1 } from "./services";
import { Request as JWTRequest } from "express-jwt";

export { TcmIngredient, TcmProductOption, TcmProductOptionValue, TcmShop }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue, TcmShop ]


const providers: DataProviderDefintions<Application & ITypeORMAware> = {

    '/listProductOption': {
        handler: async function ({ page, limit }, items: any[]) {

            console.log((this.context.request as JWTRequest).auth)

            const { rows, count } = await Service1.get(this).listProductOptions(page, limit)

            return [PaginatedList(TcmProductOption, rows, count)].concat(rows.map(r => r.shop))
        },
        output: [
            [TcmProductOption, 'name', 'quantity', 'shop'],
            [TcmShop, 'name']
        ]
    },

    '/editProductOption': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.app.getDataSource(this.context).getRepository(TcmProductOption)
                        .findOne({ relations: { ingredients: true }, where: { id }})
                    : new TcmProductOption()

            return [po]
        },
        output: [
            [TcmProductOption, 'name', 'ingredients', 'shop', 'quantity'],
            [TcmShop, 'name'],
            [TcmIngredient, 'name', 'price']
        ]
    }
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
        rules: [
            [ 'name', changes => !!changes.name, { message: 'empty' } ],
            [ 'name', checkNameDup, { message: 'name not valid' } ]
        ]
    }
]



export const Module1 = defineModule()
    .buildPersistence(TypeORMPersistence
        .build()
        .addDefinitions(ioDefinitions)
    )
    .addDataProviders(providers)


