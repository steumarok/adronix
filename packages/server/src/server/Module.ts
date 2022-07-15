import { Objects } from "@adronix/base"
import { Application } from "./Application"
import { DataSetProcessor } from "./DataSetProcessor"
import { EntityDataSetProcessor } from "./EntityDataSetProcessor"
import { ItemCollector } from "./ItemCollector"
import { DataProvider, ReturnType } from "./types"




type Cls = abstract new (app: Application) => EntityDataSetProcessor
type ClsOut = new (app: Application) => DataSetProcessor



export abstract class Module<A extends Application> {
    constructor(protected app: A) {
    }

    protected registerProvider(
        path: string,
        dataProvider: DataProvider,
        base: Cls) {
        this.app.registerProcessor(path, () => Objects.create(this.createDataSetProcessor(dataProvider, base)))
    }

    //abstract getBaseDataSetProcessor(): Cls

    createDataSetProcessor(
        dataProvider: DataProvider,
        base: Cls): ClsOut {
        const this_ = this
        return class extends base {
            constructor() {
                super(this_.app)
            }

            protected async getItems(params: Map<String, any>): Promise<ItemCollector> {

                const collector = await super.getItems(params)

                const items = await dataProvider(Object.fromEntries(params))

                return items.reduce((a, b) => this.add(a, b), collector)
            }

            add(collector: ItemCollector, item: ReturnType) {
                if (typeof item == 'function') {
                    return collector.add(item)
                } else if (typeof item == 'object') {
                    return collector.addOne(item)
                } else {
                    return collector
                }
            }
        }

    }
}