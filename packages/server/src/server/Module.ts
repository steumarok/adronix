import { EntityClass, EntityProps, Persistence, PersistenceBuilder, Transaction } from "@adronix/persistence"
import { Application } from "./Application"
import { EntityDataSetProcessor } from "./EntityDataSetProcessor"
import { ItemCollector } from "./ItemCollector"
import { DataProvider, Params, ReturnType } from "./types"



type Descriptor = (collector: ItemCollector) => ItemCollector


export abstract class Module<A extends Application> {
    readonly providers: Map<string, { dataProvider: DataProvider<A>, descriptor: Descriptor}[]> = new Map()

    constructor(readonly app: A) {
    }

    usePersistence(persistence: Persistence) {
        persistence.entityIOMap.forEach((value, key) => this.app.addEntityIO(key, value.entityIO, value.transactionManager))
    }

    bind(fn: (changes: EntityProps, entity: any, module: Module<A>) => Promise<boolean>) {
        return (changes: EntityProps, entity: any) => {
            return fn(changes, entity, this)
        }
    }

    overrideProvider(
        path: string,
        dataProvider: DataProvider<A>,
        descriptor: Descriptor) {

        if (!this.providers.has(path)) {
            return
        }

        this.providers
            .get(path)
            .push({
                dataProvider,
                descriptor
            })
    }


    registerProvider(
        path: string,
        dataProvider: DataProvider<A>,
        descriptor: Descriptor) {

        this.providers.set(path, [{
            dataProvider,
            descriptor
        }])
        this.app.registerProcessor(path, () => this.createDataSetProcessor(path))
    }

    createDataSetProcessor(
        path: string): EntityDataSetProcessor {

        const module = this
        return new class extends EntityDataSetProcessor {
            constructor() {
                super(module)
            }

            protected async getItems(params: Map<String, any>): Promise<ItemCollector> {

                const dataProviders = module.providers.get(path).map(({ dataProvider }) => dataProvider)
                const descriptors = module.providers.get(path).map(({ descriptor }) => descriptor)

                const collector = descriptors.reduce(
                    (collector, descriptor) => descriptor.call(module, collector),
                    await super.getItems(params))

                const p = Object.fromEntries(params)
                const items = await dataProviders.reduce(
                    async (items, provider) => {
                        const i = await items
                        return i.concat(await provider.call(module, p, module, i))
                    },
                    Promise.resolve([]))

                return items.reduce(
                    (collector, item) => this.add(collector, item),
                    collector)
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




type EntityDescriptor = { entityClass: EntityClass<unknown>, propNames: string[] }

export function defineModule<A extends Application>() {
    var persistenceBuilder: (module: Module<A>) => PersistenceBuilder<Transaction>
    var currentProviderPath: string
    const dataProviders: Map<string, DataProvider<A>> = new Map()
    const descriptorsMap: Map<string, EntityDescriptor[]> = new Map()
    return class extends Module<A> {
        constructor(app: A) {
            super(app)
            if (persistenceBuilder) {
                this.usePersistence(persistenceBuilder(this).create())
            }
            dataProviders.forEach((provider, path) => {
                this.registerProvider(path, (params: Params) => {
                    return provider(params, this, [])
                },
                this.describe(path))
            })
        }
        getDescriptors(path: string) {
            return descriptorsMap.get(path) || []
        }
        describe(path: string) {
            const descriptors = this.getDescriptors(path)
            return (collector: ItemCollector) => {
                return descriptors.reduce((a, b) => a.describe(b.entityClass, b.propNames), collector)
            }
        }
        static buildPersistence(builder: (module: Module<A>) => PersistenceBuilder<Transaction>) {
            persistenceBuilder = builder
            return this
        }
        static addDataProvider(path: string, provider: DataProvider<A>) {
            dataProviders.set(path, provider)
            currentProviderPath = path
            return this
        }
        static describe(entityClass: EntityClass<unknown>, propNames: string[]) {
            const descriptors = descriptorsMap.get(currentProviderPath) || []
            descriptors.push({ entityClass, propNames })
            descriptorsMap.set(currentProviderPath, descriptors)
            return this
        }
    }
}