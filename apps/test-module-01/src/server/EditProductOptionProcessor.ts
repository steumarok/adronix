import { EntityClass } from "@adronix/persistence/src";
import { ItemCollector } from "@adronix/server";
import { TypeORMTransactionManager } from "@adronix/typeorm";
import { DataSource } from "typeorm";
import { TcmProductOption } from "../entities/TcmProductOption";
import { TcmProductOptionValue } from "../entities/TcmProductOptionValue";
import { BaseDataSetProcessor } from "./BaseDataSetProcessor";


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

export class EditProductOptionProcessor extends BaseDataSetProcessor {

    constructor(transactionManager: TypeORMTransactionManager, dataSource: DataSource) {
        super(transactionManager, dataSource)
    }

    protected async getItems(params: Map<String, any>) {

        const po =  await this.dataSource.getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .leftJoinAndSelect("po.ingredients", "ingredient")
            .where("po.id = :id", { id: params.get('id') })
            .getOne()

            /*
        const { count } = await this.dataSource.getRepository(TcmProductOptionValue)
            .createQueryBuilder("tov")
            .select("count(*)", "count")
            //.where("tov.productOption.id = :productOptionId", { productOptionId: po.id })
            .getRawOne()
            */

        const page = parseInt(params.get('page'))

        const [ povs, count ] = await this.dataSource.getRepository(TcmProductOptionValue)
            .createQueryBuilder("tov")
            .leftJoinAndSelect("tov.productOption", "productOption")
            .skip((page-1) * 10)
            .take(10)
            .where("tov.productOption.id = :productOptionId", { productOptionId: po.id })
            .getManyAndCount()


        return (await super.getItems(params))
            .addOne(po)
            .add(PaginatedList(TcmProductOptionValue, povs, count));
    }

}