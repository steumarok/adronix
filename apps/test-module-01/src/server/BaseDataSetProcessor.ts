import { Objects } from "@adronix/base";
import { EntityDataSetProcessor, ItemCollector } from "@adronix/server";
import { TypeORMTransactionManager } from "@adronix/typeorm";
import { TcmProductOption } from "../entities/TcmProductOption";
import { TcmIngredient } from "../entities/TcmIngredient";
import { TcmProductOptionValue } from "../entities/TcmProductOptionValue";
import { ProductOptionIO } from "../persistence/ProductOptionIO";
import { ProductOptionValueIO } from "../persistence/ProductOptionValueIO";
import { DataSource } from "typeorm";
import { TestApplication, Module1 } from "..";

export abstract class BaseDataSetProcessor extends EntityDataSetProcessor {

    constructor(app: TestApplication) {
        super()
        this.addEntityIO(
            TcmProductOption,
            Objects.create(ProductOptionIO, app.getDataSource()), app.getTransactionManager())
        this.addEntityIO(
            TcmProductOptionValue,
            Objects.create(ProductOptionValueIO, app.getDataSource()), app.getTransactionManager())
    }

    protected async getItems(params: Map<String, any>): Promise<ItemCollector> {
        return (await super.getItems(params))
            .describe(TcmProductOption, ['name', 'ingredients'])
            .describe(TcmIngredient, ['name'])
            .describe(TcmProductOptionValue, ['price', 'productOption']);
    }
}