import { Objects } from "@adronix/base"
import { EntityClass, EntityIO, Persistence, Transaction, TransactionManager } from "@adronix/persistence"
import { Application } from "./Application"
import { DataSetProcessor } from "./DataSetProcessor"
import { EntityDataSetProcessor } from "./EntityDataSetProcessor"
import { ItemCollector } from "./ItemCollector"
import { DataProvider, ReturnType } from "./types"




//type Cls = abstract new (app: Application) => EntityDataSetProcessor
type ClsOut = new (app: Module<Application>) => EntityDataSetProcessor

type Descriptor = (collector: ItemCollector) => ItemCollector



export abstract class Module<A extends Application> {
    constructor(readonly app: A) {
    }

    usePersistence<Tx extends Transaction>(persistence: Persistence<Tx>) {
        persistence.entityIOMap.forEach((value, key) => this.app.addEntityIO(key, value.entityIO, value.transactionManager))
    }

    protected registerProvider(
        path: string,
        dataProvider: DataProvider,
        descriptor: Descriptor) {
        this.app.registerProcessor(path, () => Objects.create(this.createDataSetProcessor(dataProvider, descriptor)))
    }

    createDataSetProcessor(
        dataProvider: DataProvider,
        descriptor: Descriptor): ClsOut {
        const this_ = this
        return class extends EntityDataSetProcessor {
            constructor() {
                super(this_)
            }

            protected async getItems(params: Map<String, any>): Promise<ItemCollector> {

                const collector =  descriptor.call(this_, await super.getItems(params))

                const items = await dataProvider.call(this_, Object.fromEntries(params))

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