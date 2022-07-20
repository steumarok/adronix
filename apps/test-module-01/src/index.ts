import { Application, defineModule, Module, PaginatedList } from "@adronix/server";
import { DataProvider } from "@adronix/server/src/server/types";
import { ITypeORMAware, TypeORMPersistence } from "@adronix/typeorm";
import { Not } from "typeorm";
import { TcmProductOptionValue, TcmProductOption, TcmIngredient } from "./entities";

export { TcmIngredient, TcmProductOption, TcmProductOptionValue }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue ]


export type TestApplication = Application & ITypeORMAware


const listProductOption: DataProvider<TestApplication> = async ({ page, limit }, module) => {

    const [ pos, count ] = await module.app.getDataSource().getRepository(TcmProductOption)
        .createQueryBuilder("po")
        .skip((parseInt(page)-1) * parseInt(limit))
        .take(parseInt(limit))
        .getManyAndCount()

    return [PaginatedList(TcmProductOption, pos, count)]
}

export async function editProductOption({ id }, module: Module<TestApplication>) {
    const po =
        id
            ? await module.app.getDataSource().getRepository(TcmProductOption)
                .findOne({ relations: { ingredients: true }, where: { id }})
            : new TcmProductOption()

    return [po]
}

function checkName(module: Module<TestApplication>) {
    return async ({name}, entity?: TcmProductOption) => {
        const conditions = entity ? { id: Not(entity.id) } : {}
        const po = await module.app.getDataSource().getRepository(TcmProductOption)
            .findOne({ where: { name, ...conditions }})
        return !po
    }
}

async function checkName1({name}, entity: TcmProductOption, module: Module<TestApplication>) {
    const conditions = entity ? { id: Not(entity.id) } : {}
    const po = await module.app.getDataSource().getRepository(TcmProductOption)
        .findOne({ where: { name, ...conditions }})
    return !po
}


export const Module1 = defineModule<TestApplication>()
    .buildPersistence(module => {
        return TypeORMPersistence.build(module.app)
            .defineEntityIO(TcmProductOption)
                .rule('name', changes => !!changes.name, { message: 'empty' })
                .asyncRule("name", module.bind(checkName1), { message: 'name not valid' })
            .defineEntityIO(TcmProductOptionValue)
                //.asyncRule("price", this.checkPrice, { message: 'price not valid' })

    })
    .addDataProvider("/listProductOption", listProductOption)
        .describe(TcmProductOption, ['name'])
    .addDataProvider("/editProductOption", editProductOption)
        .describe(TcmProductOption, ['name', 'ingredients'])


