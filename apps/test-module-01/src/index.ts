import { AsyncRuleExpr, EntityIODefinitions } from "@adronix/persistence/src/persistence/types";
import { Application, defineModule, Module, PaginatedList, ServiceContext } from "@adronix/server";
import { DataProviderDefintions } from "@adronix/server/src/server/types";
import { ITypeORMAware, TypeORMPersistence } from "@adronix/typeorm";
import { Not } from "typeorm";
import { TcmProductOptionValue, TcmProductOption, TcmIngredient } from "./entities";
import { Service1, Service2 } from "./services";
import { Request as JWTRequest } from "express-jwt";

export { TcmIngredient, TcmProductOption, TcmProductOptionValue }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue ]

export type TestApplication = Application & ITypeORMAware

const providers: DataProviderDefintions<TestApplication> = {

    '/listProductOption': {
        handler: async function (context, { page, limit }, items: any[]) {

            console.log((context.request as JWTRequest).auth)

            //const { rows, count } = await this.app.services<Service1>(Service1, context).listProductOptions(page, limit)
            const { rows, count } = await Module1_Service1(this, context).listProductOptions(page, limit)

            return [PaginatedList(TcmProductOption, rows, count)]
        },
        output: [
            [TcmProductOption, 'name']
        ]
    },

    '/editProductOption': {
        handler: async function(ctx, { id }) {
            const po =
                id
                    ? await this.app.getDataSource(ctx).getRepository(TcmProductOption)
                        .findOne({ relations: { ingredients: true }, where: { id }})
                    : new TcmProductOption()

            return [po]
        },
        output: [
            [TcmProductOption, 'name', 'ingredients']
        ]
    }
}




const checkNameDup: AsyncRuleExpr = async function(ctx, { name }, entity: TcmProductOption) {
    const conditions = entity ? { id: Not(entity.id) } : {}
    const po = await (this as ITypeORMAware).getDataSource(ctx).getRepository(TcmProductOption)
        .findOne({ where: { name, ...conditions }})
    return !po
}


const ioDefinitions: EntityIODefinitions = [
    {
        entityClass: TcmProductOption,
        rules: [
            [ 'name', (_ctx, changes) => !!changes.name, { message: 'empty' } ],
            [ 'name', checkNameDup, { message: 'name not valid' } ]
        ]
    }
]



export const Module1 = defineModule<TestApplication>()
    .buildPersistence(TypeORMPersistence
        .build()
        .addDefinitions(ioDefinitions)
    )
    .addDataProviders(providers)
    .addServices(Service1, Service2)

const Module1_Service1 = (module: Module<TestApplication>, context: ServiceContext) => module.app.services<Service1>(Service1, context)
