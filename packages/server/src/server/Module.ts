import { Errors, Objects, Validator } from "@adronix/base"
import { EntityClass, EntityProps, IPersistenceExtender, Persistence, PersistenceBuilder, PersistenceExtension } from "@adronix/persistence"
import { rawListeners } from "process"
import { AbstractService } from "./AbstractService"
import { Application } from "./Application"
import { BetterSseNotificationChannel } from "./BetterSseNotificationChannel"
import { HttpContext } from "./Context"
import { EntityDataSetProcessor } from "./EntityDataSetProcessor"
import { FormProcessor } from "./FormProcessor"
import { IOService } from "./IOService"
import { ItemCollector } from "./ItemCollector"
import { NotificationChannel } from "./NotificationChannel"
import { DataProvider, DataProviderDefinitions, FormDefinitions, FormHandler, FormRule, FormRules, ModuleOptions, Params, ReturnType } from "./types"



type Descriptor = (collector: ItemCollector) => ItemCollector


export abstract class Module<A extends Application = Application> {
    readonly providers: Map<string, { dataProvider: DataProvider, descriptor: Descriptor}[]> = new Map()
    readonly formHandlers: Map<string, { handler: FormHandler, rules: FormRules }> = new Map()
    readonly notificationChannels: Map<string, NotificationChannel> = new Map()
    readonly serviceClasses: Array<typeof AbstractService<A>> = []

    constructor(
        readonly app: A) {
    }

    usePersistence(persistence: Persistence) {
        persistence.entityIOCreatorMap.forEach(
            (value, entityClass) => IOService.addEntityIOCreator(entityClass, value))
    }

    bind(fn: (changes: EntityProps, entity: any, module: Module<A>) => Promise<boolean>) {
        return (changes: EntityProps, entity: any) => {
            return fn(changes, entity, this)
        }
    }

    overrideProvider(
        path: string,
        dataProvider: DataProvider,
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

    registerService(serviceClass: typeof AbstractService<A>) {
        this.serviceClasses.push(serviceClass)
    }

    registerFormHandler(
        path: string,
        handler: FormHandler,
        rules: FormRules) {

        this.formHandlers.set(path, { handler, rules })
    }

    registerProvider(
        path: string,
        dataProvider: DataProvider,
        descriptor: Descriptor) {

        this.providers.set(path, [{
            dataProvider,
            descriptor
        }])
    }

    registerNotificationChannel(name: string, channel: NotificationChannel) {
        this.notificationChannels.set(name, channel)
    }

    createFormProcessor(
        path: string): FormProcessor {

        const module = this
        return new class extends FormProcessor {
            constructor() {
                super(module)
            }

            async submit(
                payload: any,
                context: HttpContext): Promise<Errors | void> {

                const { handler, rules } = module.formHandlers.get(path)

                function isArrayOfArray<T>(arr: T | T[]): arr is Array<T> {
                    return Array.isArray(arr[0])
                }

                const validator = Object.keys(rules)
                    .reduce((v, name) => {
                        const el = rules[name]
                        const list = isArrayOfArray(el) ? el : [el]
                        return list.reduce((v0, r) => v0.addRule(
                            async () => {
                                const result = await r[0].call(context, payload, name)
                                if (!result) {
                                    return {
                                        name,
                                        error: r[1]
                                    }
                                }
                            }
                        ), v)
                    }, new Validator())

                const errors = await validator.validate()
                if (Object.keys(errors).length > 0) {
                    return errors
                }

                return await handler.call(context, payload)
            }
        }
    }

    createDataSetProcessor(
        path: string): EntityDataSetProcessor {

        const module = this
        return new class extends EntityDataSetProcessor {
            constructor() {
                super(module)
            }

            protected async getItems(
                params: Map<String, any>,
                context: HttpContext): Promise<ItemCollector> {

                const dataProviders = module.providers.get(path).map(({ dataProvider }) => dataProvider)
                const descriptors = module.providers.get(path).map(({ descriptor }) => descriptor)

                const collector = descriptors.reduce(
                    (collector, descriptor) => descriptor.call(module, collector),
                    await super.getItems(params, context))

                const p = Object.fromEntries(params)
                return await dataProviders.reduce(
                    async (collector, provider) => {
                        const c = await collector
                        const items = c.getCollectedItems()
                        const newItems = await provider.call(context, p, items)

                        return newItems.reduce(
                            (collector, item) => this.add(collector, item),
                            c)
                    },
                    Promise.resolve(collector))
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

export function defineModule<A extends Application = Application>() {
    var persistenceBuilder: PersistenceBuilder
    var persistenceBuilderCallback: (extender: IPersistenceExtender) => IPersistenceExtender
    var currentProviderPath: string

    const notificationChannels: Map<string, NotificationChannel> = new Map()
    const serviceClasses: Array<typeof AbstractService<A>> = []

    const formHandlers: Map<string, { handler: FormHandler, rules: FormRules }> = new Map()

    const dataProviders: Map<string, DataProvider> = new Map()
    const descriptorsMap: Map<string, EntityDescriptor[]> = new Map()

    return class extends Module<A> {
        constructor(app: A) {
            super(app)

            if (persistenceBuilder) {
                if (persistenceBuilderCallback) {
                    persistenceBuilder = persistenceBuilderCallback(persistenceBuilder) as PersistenceBuilder
                }
                this.usePersistence(persistenceBuilder.create())
            }

            dataProviders.forEach((provider, path) => {
                this.registerProvider(
                    path,
                    provider,
                    this.describe(path)
                )
            })

            formHandlers.forEach(({ handler, rules }, path) => {
                this.registerFormHandler(path, handler, rules)
            })

            serviceClasses.forEach(service => this.registerService(service))

            notificationChannels.forEach((channel, name) => {
                this.registerNotificationChannel(name, channel)
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

        static addFormHandlers(...formDefinitionsList: FormDefinitions[]) {
            formDefinitionsList.forEach(formDefinitions => {
                for (const path in formDefinitions) {
                    this.addFormHandler(
                        path,
                        formDefinitions[path].handler,
                        formDefinitions[path].rules)
                }
            })
            return this
        }
        static addFormHandler(path: string, handler: FormHandler, rules: FormRules) {
            formHandlers.set(path, { handler, rules })
            return this
        }

        static addNotificationChannel(name: string) {
            notificationChannels.set(name, new BetterSseNotificationChannel())
            return this
        }

        static addServices(...classes: typeof AbstractService<A>[]) {
            classes.forEach(cls => serviceClasses.push(cls))
            return this
        }

        static addDataProvider(path: string, provider: DataProvider) {
            dataProviders.set(path, provider)
            currentProviderPath = path
            return this
        }
        static addDataProviders(...providersList: DataProviderDefinitions[]) {
            providersList.forEach(providers => {
                for (const path in providers) {
                    const self = this.addDataProvider(path, providers[path].handler)
                    providers[path].output.forEach(([entityClass, ...propNames]) => {
                        self.describe(entityClass, propNames)
                    })
                }
            })
            return this
        }
        static describe(entityClass: EntityClass<unknown>, propNames: string[]) {
            const descriptors = descriptorsMap.get(currentProviderPath) || []
            descriptors.push({ entityClass, propNames })
            descriptorsMap.set(currentProviderPath, descriptors)
            return this
        }
        static extend() {
            const dataProviders: Map<string, DataProvider> = new Map()
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
                extendDataProviders(...providersList: DataProviderDefinitions[]) {
                    providersList.forEach(providers => {
                        for (const path in providers) {
                            const self = this.extendDataProvider(path, providers[path].handler)
                            providers[path].output.forEach(([entityClass, ...propNames]) => {
                                self.describe(entityClass, propNames)
                            })
                        }
                        })
                    return overrider
                },
                extendDataProvider(path: string, provider: DataProvider) {
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
