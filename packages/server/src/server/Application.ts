import { IPersistenceManager } from "@adronix/persistence"
import { BetterSseNotificationChannel } from "./BetterSseNotificationChannel"
import { DataSetProcessor } from "./DataSetProcessor"
import { Module } from "./Module"
import { NotificationChannel } from "./NotificationChannel"
import { Objects } from "@adronix/base/src"
import { ModuleOptions, ServiceOptions, WebModuleOptions } from "./types"
import { FormProcessor } from "./FormProcessor"
import { AbstractService, ServiceContext } from "./AbstractService"
import { IncomingMessage, ServerResponse } from "http"


export class CallContext implements ServiceContext {
    constructor (
        public readonly request: IncomingMessage,
        public readonly response: ServerResponse,
        public readonly tenantId: string) { }
}

export abstract class Application implements IPersistenceManager {

    protected readonly modules: Module<Application>[] = []
    protected readonly serviceClassMap: Map<typeof AbstractService<Application>, ServiceOptions> = new Map();

    services<S extends AbstractService<Application>>(
        cls: typeof AbstractService<Application> | string,
        context: ServiceContext): S {

        if (typeof cls == "string") {
            cls = Array.from(this.serviceClassMap.keys()).find(serviceClass => cls == serviceClass.name)
        }

        const service = Objects.create(cls, this, context) as S

        if (this.serviceClassMap.has(cls)) {
            const options = this.serviceClassMap.get(cls)
            if (options?.proxy) {
                return options.proxy.wrap(service)
            }
        }

        return service
    }

    getTenantId(_request: IncomingMessage): string {
        return null
    }

    addModule(
        moduleClass: new (app: Application) => Module<Application>,
        options?: ModuleOptions) {
        const module = Objects.create(moduleClass, this, options)

        module.serviceClasses.forEach(serviceClass => {
            this.serviceClassMap.set(serviceClass, options?.services?.find(([cls]) => cls == serviceClass)[1])
        })

        this.modules.push(module)
        return module
    }
}

export abstract class WebApplication extends Application {
    readonly defaultNotificationChannel: NotificationChannel = new BetterSseNotificationChannel()

    constructor() {
        super()
    }

    setDefaultNotificationChannel(path: string) {
        this.registerNotificationChannel(path, this.defaultNotificationChannel, false)
    }

    addNotificationChannel(path: string, secured: boolean): NotificationChannel {
        const channel = new BetterSseNotificationChannel()
        this.registerNotificationChannel(path, channel, secured)
        return channel
    }

    composePath(path: string, options?: WebModuleOptions) {
        return (options?.web?.urlContext ? options?.web.urlContext : '') + path
    }

    addModule(
        moduleClass: new (app: Application) => Module<Application>,
        options?: WebModuleOptions) {
        const module = super.addModule(moduleClass, options)

        module.providers.forEach((_value, path) => {
            this.registerProcessor(
                this.composePath(path, options),
                () => module.createDataSetProcessor(path),
                options.secured)
        })

        module.formHandlers.forEach((_value, path) => {
            this.registerFormProcessor(
                this.composePath(path, options),
                () => module.createFormProcessor(path),
                options.secured)
        })

        return module
    }

    async createCallContext(
        request: IncomingMessage,
        response: ServerResponse) {
        return new CallContext(request, response, this.getTenantId(request))
    }

    abstract registerProcessor(
        path: string,
        dataSetProcessor: () => DataSetProcessor,
        secured: boolean): void

    abstract registerFormProcessor(
        path: string,
        formProcessor: () => FormProcessor,
        secured: boolean): void

    abstract registerNotificationChannel(
        path: string,
        channel: NotificationChannel,
        secured: boolean): void
}