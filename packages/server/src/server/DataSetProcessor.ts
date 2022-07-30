import { ItemCollector } from "./ItemCollector"
import { ItemData } from "./types"
import { Objects } from '@adronix/base'
import { Application } from "./Application"
import { Module } from "./Module"
import { HttpContext } from "./Context"

export abstract class DataSetProcessor {

    constructor(protected module: Module<Application>) {
    }

    abstract sync(
        data: ItemData[],
        context: HttpContext): Promise<{ data: ItemData[], status: number }>

    async fetch(
        params: Map<String, any>,
        context: HttpContext) {
        const collector = await this.getItems(params, context)
        return collector.get()
    }

    protected async getItems(
        params: Map<String, any>,
        context: HttpContext): Promise<ItemCollector> {
        return this.createCollector()
    }

    protected createCollector(): ItemCollector {
        return Objects.create(ItemCollector)
    }
}