import { ItemCollector } from "./ItemCollector"
import { ItemData } from "./types"
import { Objects } from 'adronix-base'

export abstract class DataSetProcessor {
    abstract sync(data: ItemData[]): Promise<ItemData[]>

    async fetch(params: Map<String, any>) {
        const collector = await this.getItems(params)
        return collector.get()
    }

    protected async getItems(params: Map<String, any>): Promise<ItemCollector> {
        return Objects.create(ItemCollector)
    }
}