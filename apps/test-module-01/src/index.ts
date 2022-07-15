import { EntityClass } from "@adronix/persistence/src";
import { Application, DataProvider, ItemCollector, Module } from "@adronix/server";
import { TypeORMTransactionManager } from "@adronix/typeorm/src";
import { DataSource } from "typeorm";
import { TcmIngredient } from "./entities/TcmIngredient";
import { TcmProductOption } from "./entities/TcmProductOption";
import { TcmProductOptionValue } from "./entities/TcmProductOptionValue";
import { BaseDataSetProcessor } from "./server/BaseDataSetProcessor";

//export { EditProductOptionProcessor } from './server/EditProductOptionProcessor'
//export { ListProductOptionProcessor } from './server/ListProductOptionProcessor'
export { BaseDataSetProcessor } from './server/BaseDataSetProcessor'

export { TcmIngredient, TcmProductOption, TcmProductOptionValue }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue ]





function PaginatedList<T>(
    entityClass: EntityClass<T>,
    items: T[],
    totalCount: number): (collector: ItemCollector) => ItemCollector {
    return collector => {
        const { idGetter } = collector.descriptors.get(entityClass)
        return collector
            .metadata(`${entityClass.name}.totalCount`, totalCount)
            .metadata(`${entityClass.name}.ids`, items.map(pov => idGetter(pov)))
            .addList(items)
    }
}




export type TestApplication = Application & {
    getDataSource: () => DataSource,
    getTransactionManager: () => TypeORMTransactionManager
}

export class Module1 extends Module<TestApplication> {
    constructor(app: TestApplication) {
        super(app)
        this.registerProvider("/listProductOption", this.listProductOption, BaseDataSetProcessor)
        this.registerProvider("/editProductOption", this.editProductOption, BaseDataSetProcessor)
    }

    listProductOption: DataProvider = async ({ page, limit }) => {

        const [ pos, count ] = await this.app.getDataSource().getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .skip((parseInt(page)-1) * parseInt(limit))
            .take(parseInt(limit))
            .getManyAndCount()


        return [PaginatedList(TcmProductOption, pos, count)]
    }

    editProductOption: DataProvider = async ({ id }) => {

        const po =  await this.app.getDataSource().getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .leftJoinAndSelect("po.ingredients", "ingredient")
            .where("po.id = :id", { id })
            .getOne()

        console.log(po)

        return [po]
    }
}

