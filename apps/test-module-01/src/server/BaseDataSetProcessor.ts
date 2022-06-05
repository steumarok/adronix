import { Objects } from "@adronix/base";
import { EntityDataSetProcessor, ItemCollector } from "@adronix/server";
import { TypeORMTransactionManager } from "@adronix/typeorm";
import { TcmProductOption } from "../entities/TcmProductOption";
import { TcmIngredient } from "../entities/TcmIngredient";
import { TcmProductOptionValue } from "../entities/TcmProductOptionValue";
import { ProductOptionIO } from "../persistence/ProductOptionIO";
import { ProductOptionValueIO } from "../persistence/ProductOptionValueIO";
import { DataSource } from "typeorm";

export abstract class BaseDataSetProcessor extends EntityDataSetProcessor {

    constructor(transactionManager: TypeORMTransactionManager, protected dataSource: DataSource) {
        super()
        this.addEntityIO(TcmProductOption, Objects.create(ProductOptionIO, dataSource), transactionManager)
        this.addEntityIO(TcmProductOptionValue, Objects.create(ProductOptionValueIO, dataSource), transactionManager)
    }

    protected async getItems(params: Map<String, any>): Promise<ItemCollector> {
        return (await super.getItems(params))
            .describe(TcmProductOption, ['name', 'ingredients'])
            .describe(TcmIngredient, ['name'])
            .describe(TcmProductOptionValue, ['price', 'productOption']);
    }
}