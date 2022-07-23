import { AsyncRuleExpr, EntityClass, EntityIODefinitions, ItemError, RuleExpr } from "@adronix/persistence/src/persistence/types";
import { Application, defineModule, Module, PaginatedList } from "@adronix/server";
import { DataProvider, DataProviderDefintions } from "@adronix/server/src/server/types";
import { ITypeORMAware, TypeORMPersistence } from "@adronix/typeorm";
import { Not } from "typeorm";
import { TcmProductOptionValue, TcmProductOption, TcmIngredient } from "./entities";

export { TcmIngredient, TcmProductOption, TcmProductOptionValue }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue ]

export type TestApplication = Application & ITypeORMAware


const providers: DataProviderDefintions<TestApplication> = {

    '/listProductOption': {
        handler: async function ({ page, limit }) {

            const [ pos, count ] = await this.app.getDataSource().getRepository(TcmProductOption)
                .createQueryBuilder("po")
                .skip((parseInt(page)-1) * parseInt(limit))
                .take(parseInt(limit))
                .getManyAndCount()

            return [PaginatedList(TcmProductOption, pos, count)]
        },
        output: [
            [TcmProductOption, 'name']
        ]
    },

    '/editProductOption': {
        handler: async function({ id }) {
            const po =
                id
                    ? await this.app.getDataSource().getRepository(TcmProductOption)
                        .findOne({ relations: { ingredients: true }, where: { id }})
                    : new TcmProductOption()

            return [po]
        },
        output: [
            [TcmProductOption, 'name', 'ingredients']
        ]
    }
}




const checkNameDup: AsyncRuleExpr = async function({ name }, entity: TcmProductOption) {
    const conditions = entity ? { id: Not(entity.id) } : {}
    const po = await (this as ITypeORMAware).getDataSource().getRepository(TcmProductOption)
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

export const Module1 = defineModule<TestApplication>()
    .buildPersistence(TypeORMPersistence
        .build()
        .addDefinitions(ioDefinitions)
    )
    .addDataProviders(providers)


