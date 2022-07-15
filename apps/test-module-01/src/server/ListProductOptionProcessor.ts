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

export class ListProductOptionProcessor extends BaseDataSetProcessor {

    constructor(transactionManager: TypeORMTransactionManager) {
        super(transactionManager)
    }

    protected async getItems(params: Map<String, any>) {

        const page = parseInt(params.get('page'))
        const limit = parseInt(params.get('limit'))

        const [ pos, count ] = await this.transactionManager.dataSource.getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .skip((page-1) * limit)
            .take(limit)
            .getManyAndCount()


        return (await super.getItems(params))
            .add(PaginatedList(TcmProductOption, pos, count));
    }

}