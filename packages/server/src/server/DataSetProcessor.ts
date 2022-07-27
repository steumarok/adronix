import { ItemCollector } from "./ItemCollector"
import { ItemData } from "./types"
import { Objects } from '@adronix/base'
import { Application, CallContext } from "./Application"
import { Module } from "./Module"
import { IncomingMessage, ServerResponse } from "http"

export abstract class DataSetProcessor {

    constructor(protected module: Module<Application>) {
    }

    abstract sync(
        data: ItemData[],
        context: CallContext): Promise<{ data: ItemData[], status: number }>

    async fetch(
        params: Map<String, any>,
        context: CallContext) {
        const collector = await this.getItems(params, context)
        return collector.get()
    }

    protected async getItems(
        params: Map<String, any>,
        context: CallContext): Promise<ItemCollector> {
        return this.createCollector()
    }

    protected createCollector(): ItemCollector {
        return Objects.create(ItemCollector)
    }
}