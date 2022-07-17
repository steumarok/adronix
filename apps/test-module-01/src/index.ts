import { Objects } from "@adronix/base";
import { EntityClass, EntityProps, Persistence, Transaction, Validator } from "@adronix/persistence";
import { Application, DataProvider, ItemCollector, Module } from "@adronix/server";
import { ITypeORMApplication, TypeORMPersistence, TypeORMTransactionManager } from "@adronix/typeorm";
import { DataSource } from "typeorm";
import { TcmIngredient } from "./entities/TcmIngredient";
import { TcmProductOption } from "./entities/TcmProductOption";
import { TcmProductOptionValue } from "./entities/TcmProductOptionValue";
import { ProductOptionIO } from "./persistence/ProductOptionIO";
import { ProductOptionValueIO } from "./persistence/ProductOptionValueIO";

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




export type TestApplication = Application & ITypeORMApplication

class Module1Persistence extends TypeORMPersistence {
    constructor(app: TestApplication) {
        super(app);

        this.defineEntityIO(
            TcmProductOption,
            (validator, changes) => validator
                .addRule("name", () => changes.name != "", { message: 'empty' }))

        this.defineEntityIO(
            TcmProductOptionValue,
            (validator, changes) => validator
                .addRule("price", () => changes.price != 0, { message: 'price not valid' }))
    }
}



export class Module1 extends Module<TestApplication> {
    constructor(app: TestApplication) {
        super(app)

        this.usePersistence(Objects.create(Module1Persistence, app))

        this.registerProvider("/listProductOption", this.listProductOption, this.describe)
        this.registerProvider("/editProductOption", this.editProductOption, this.describe)
    }


    describe(collector: ItemCollector) {
        return collector
            .describe(TcmProductOption, ['name', 'ingredients'])
            .describe(TcmIngredient, ['name'])
            .describe(TcmProductOptionValue, ['price', 'productOption']);
    }

    async listProductOption({ page, limit }) {

        const [ pos, count ] = await this.app.getDataSource().getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .skip((parseInt(page)-1) * parseInt(limit))
            .take(parseInt(limit))
            .getManyAndCount()


        return [PaginatedList(TcmProductOption, pos, count)]
    }

    async editProductOption({ id }) {

        const po =  await this.app.getDataSource().getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .leftJoinAndSelect("po.ingredients", "ingredient")
            .where("po.id = :id", { id })
            .getOne()

        return [po]
    }
}

