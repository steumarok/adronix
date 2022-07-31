import { BetterSseNotificationChannel } from "./BetterSseNotificationChannel"
import { DataSetProcessor } from "./DataSetProcessor"
import { Module } from "./Module"
import { NotificationChannel } from "./NotificationChannel"
import { Objects } from "@adronix/base"
import { ModuleOptions, ServiceOptions, WebModuleOptions } from "./types"
import { FormProcessor } from "./FormProcessor"
import { AbstractService } from "./AbstractService"
import { IncomingMessage, ServerResponse } from "http"
import { Context, ExtendedServerResponse, HttpContext } from "./Context"



export abstract class Application {

    protected readonly modules: Module<Application>[] = []
    protected readonly serviceClassMap: Map<new (app: Application, context: Context) => AbstractService, ServiceOptions> = new Map();
    protected readonly contextExtenders: ((context: Context) => any)[] = []

    service<S extends AbstractService<Application>>(
        cls: (new (app: Application, context: Context) => S) | string,
        context: Context): S {

        let serviceClass: new (app: Application, context: Context) => AbstractService
        if (typeof cls === "string") {
            serviceClass = Array.from(this.serviceClassMap.keys()).find(serviceClass => cls == serviceClass.name)
        }
        else {
            serviceClass = cls
        }

        const service = Objects.create(serviceClass, this, context) as S

        if (this.serviceClassMap.has(serviceClass)) {
            const options = this.serviceClassMap.get(serviceClass)
            if (options?.proxy) {
                return options.proxy.wrap(service)
            }
        }

        return service
    }

    protected extendContext<E>(extender: (context: Context) => E) {
        this.contextExtenders.push(extender)
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
        return (options?.http?.urlContext || '') + path
    }

    addModule(
        moduleClass: new (app: Application) => Module<Application>,
        options?: WebModuleOptions) {
        const module = super.addModule(moduleClass, options)

        module.providers.forEach((_value, path) => {
            this.registerProcessor(
                this.composePath(path, options),
                () => module.createDataSetProcessor(path),
                options?.secured)
        })

        module.formHandlers.forEach((_value, path) => {
            this.registerFormProcessor(
                this.composePath(path, options),
                () => module.createFormProcessor(path),
                options?.secured)
        })

        return module
    }

    protected extendResponse(_respoonse: ServerResponse): ServerResponse & ExtendedServerResponse  {
        throw "not implemented"
    }

    async createHttpContext(
        request: IncomingMessage,
        response: ServerResponse) {
        const ctx = new HttpContext(
            this,
            request,
            this.extendResponse(response),
            this.getTenantId(request)
        )
        const extCtx = this.contextExtenders.reduce((c, e) => ({ ...c, ...e(c) }), ctx)

        return {
            ...extCtx,
            service<S extends AbstractService>(cls: new (app: Application, context: Context) => S): S {
                return this.application.service(cls, this)
            }
        }
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