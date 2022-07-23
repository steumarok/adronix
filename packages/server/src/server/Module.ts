import { Objects } from "@adronix/base/src"
import { EntityClass, EntityProps, IPersistenceExtender, Persistence, PersistenceBuilder, PersistenceExtension } from "@adronix/persistence"
import { Application } from "./Application"
import { EntityDataSetProcessor } from "./EntityDataSetProcessor"
import { ItemCollector } from "./ItemCollector"
import { DataProvider, DataProviderDefintions, ModuleOptions, Params, ReturnType } from "./types"



type Descriptor = (collector: ItemCollector) => ItemCollector


export abstract class Module<A extends Application> {
    readonly providers: Map<string, { dataProvider: DataProvider<A>, descriptor: Descriptor}[]> = new Map()

    constructor(
        readonly app: A,
        readonly options?: ModuleOptions) {
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

    composePath(path: string) {
        return (this.options?.urlContext ? this.options?.urlContext : '') + path
    }

    registerProvider(
        path: string,
        dataProvider: DataProvider<A>,
        descriptor: Descriptor) {

        this.providers.set(path, [{
            dataProvider,
            descriptor
        }])
        this.app.registerProcessor(this.composePath(path), () => this.createDataSetProcessor(path))
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
                        return i.concat(await provider.call(module, p, i))
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
    var persistenceBuilder: PersistenceBuilder
    var persistenceBuilderCallback: (extender: IPersistenceExtender) => IPersistenceExtender
    var currentProviderPath: string
    const dataProviders: Map<string, DataProvider<A>> = new Map()
    const descriptorsMap: Map<string, EntityDescriptor[]> = new Map()
    return class extends Module<A> {
        constructor(app: A, options?: ModuleOptions) {
            super(app, options)
            if (persistenceBuilder) {
                if (persistenceBuilderCallback) {
                    persistenceBuilder = persistenceBuilderCallback(persistenceBuilder) as PersistenceBuilder
                }
                this.usePersistence(persistenceBuilder.create(app))
            }
            dataProviders.forEach((provider, path) => {
                this.registerProvider(path, (params: Params) => {
                    return provider.bind(this)(params, this, [])
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
        static buildPersistence(builder: PersistenceBuilder) {
            persistenceBuilder = builder
            return this
        }
        static addDataProvider(path: string, provider: DataProvider<A>) {
            dataProviders.set(path, provider)
            currentProviderPath = path
            return this
        }
        static addDataProviders(providers: DataProviderDefintions<A>) {
            for (const path in providers) {
                const self = this.addDataProvider(path, providers[path].handler)
                providers[path].output.forEach(([entityClass, ...propNames]) => {
                    self.describe(entityClass, propNames)
                })
            }
            return this
        }
        static describe(entityClass: EntityClass<unknown>, propNames: string[]) {
            const descriptors = descriptorsMap.get(currentProviderPath) || []
            descriptors.push({ entityClass, propNames })
            descriptorsMap.set(currentProviderPath, descriptors)
            return this
        }
        static extend() {
            const dataProviders: Map<string, DataProvider<A>> = new Map()
            const descriptorsMap: Map<string, EntityDescriptor[]> = new Map()

            function describe(path: string) {
                const descriptors = descriptorsMap.get(path)
                return (collector: ItemCollector) => {
                    return descriptors.reduce((a, b) => a.describe(b.entityClass, b.propNames), collector)
                }
            }

            Objects.override(this, base => {
                return class extends base {
                    constructor(app: A, options?: ModuleOptions) {
                        super(app, options)
                        dataProviders.forEach((provider, path) => {
                            this.overrideProvider(
                                path,
                                provider,
                                describe(path))
                        })
                    }
                }
            })

            const overrider = {
                extendDataProviders(providers: DataProviderDefintions<A>) {
                    for (const path in providers) {
                        const self = this.extendDataProvider(path, providers[path].handler)
                        providers[path].output.forEach(([entityClass, ...propNames]) => {
                            self.describe(entityClass, propNames)
                        })
                    }
                    return overrider
                },
                extendDataProvider(path: string, provider: DataProvider<A>) {
                    dataProviders.set(path, provider)
                    currentProviderPath = path
                    return overrider
                },
                describe(entityClass: EntityClass<unknown>, propNames: string[]) {
                    const descriptors = descriptorsMap.get(currentProviderPath) || []
                    descriptors.push({ entityClass, propNames })
                    descriptorsMap.set(currentProviderPath, descriptors)
                    return overrider
                },
                extendPersistence(cbOrExtension: PersistenceExtension | ((extender: IPersistenceExtender) => IPersistenceExtender)) {
                    if (typeof cbOrExtension == 'function') {
                        persistenceBuilderCallback = cbOrExtension
                    }
                    else {
                        persistenceBuilderCallback = persistence => {
                            cbOrExtension.eventHandlers.forEach(([entityClass, handler]) => {
                                persistence.addEventHandler(entityClass, handler)
                            })
                            return persistence
                        }
                    }
                    return this
                },

            }

            return overrider
        }

    }
}
/*
Objects.override(Module1, base => {
    return class extends base {
        constructor(app: A) {
            super(app)
            console.log("jjj")
        }
    }
})*/



/*
export function overrideModule<A extends Application>(moduleClass: new (app: A) => Module<A>) {
    var persistenceOverrider: (module: Module<A>) => PersistenceBuilder<Transaction>
    var currentProviderPath: string
    const dataProviders: Map<string, DataProvider<A>> = new Map()
    const descriptorsMap: Map<string, EntityDescriptor[]> = new Map()

    Objects.override(moduleClass, base => {
        return class extends base {
            constructor(app: A) {
                super(app)

//                this.overrideProvider('/editProductOption', this.editProductOptionOvr, this.describeEditProductOptionOvr)
            }
        }
    })

    const overrider = {
        overrideDataProvider(path: string, provider: DataProvider<A>) {
            dataProviders.set(path, provider)
            currentProviderPath = path
            return overrider
        },
        describe(entityClass: EntityClass<unknown>, propNames: string[]) {
            const descriptors = descriptorsMap.get(currentProviderPath) || []
            descriptors.push({ entityClass, propNames })
            descriptorsMap.set(currentProviderPath, descriptors)
            return overrider
        },
        overridePersistence(fn: (ovr: PersistenceOverrider) => PersistenceOverrider) {
            fn(persistenceOverrider)
            return this
        }
    }

    return overrider


}*/