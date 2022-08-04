import { ItemCollector } from "./ItemCollector"
import { DataProviderContext, ItemData } from "./types"
import { Objects } from '@adronix/base'
import { Application } from "./Application"
import { Module } from "./Module"
import { HttpContext } from "./Context"
import { EntityClass } from "packages/persistence"

export class OutputExtender {
    readonly dynamicPropertyMap: Map<EntityClass<unknown>, { [propertyName: string]: (entity: any) => any }> = new Map()

    add<E>(entityClass: EntityClass<E>, propertyName: string, getter: (entity: E) => any) {
        const properties = this.dynamicPropertyMap.get(entityClass) || {}
        properties[propertyName] = getter
        this.dynamicPropertyMap.set(entityClass, properties)
    }
}

export abstract class DataSetProcessor {

    constructor(protected module: Module<Application>) {
    }

    abstract sync(
        data: ItemData[],
        context: HttpContext): Promise<{ data: ItemData[], status: number }>

    async fetch(
        params: Map<String, any>,
        context: HttpContext) {
        const outputExtender = new OutputExtender()
        const collector = await this.getItems(params, this.extendContext(context, outputExtender))

        outputExtender.dynamicPropertyMap.forEach((properties, entityClass) => {
            collector.dynamics(entityClass, properties)
        })

        return collector.get()
    }

    protected extendContext(
        context: HttpContext,
        outputExtender: OutputExtender): HttpContext & DataProviderContext {
        return {
            ...context,
            output: outputExtender
        }
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