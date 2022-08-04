import { BetterSseNotificationChannel } from "./BetterSseNotificationChannel"
import { DataSetProcessor } from "./DataSetProcessor"
import { defineModule, Module } from "./Module"
import { NotificationChannel } from "./NotificationChannel"
import { Objects } from "@adronix/base"
import { ModuleOptions, ServiceOptions, WebModuleOptions } from "./types"
import { FormProcessor } from "./FormProcessor"
import { AbstractService } from "./AbstractService"
import { IncomingMessage, ServerResponse } from "http"
import { Context, ExtendedServerResponse, HttpContext } from "./Context"
import { IOService } from "./IOService"

// /api/io/sse/data
const ioModule = defineModule()
    .addNotificationChannel('data')
    .addServices(IOService)

export abstract class Application {

    protected readonly modules: Module<Application>[] = []
    protected readonly serviceClassMap:
        Map<new (app: Application, module: Module, context: Context) => AbstractService, { module: Module, options: ServiceOptions }> = new Map();
    protected readonly contextExtenders: ((context: Context) => any)[] = []

    constructor() {
        setTimeout(() => {
            this.initialize()
        }, 100)
    }

    protected initialize() {
    }

    service<S extends AbstractService<Application>>(
        cls: (new (app: Application, module: Module, context: Context) => S) | string,
        context: Context): S {
        let serviceClass: new (app: Application, module: Module, context: Context) => AbstractService
        if (typeof cls === "string") {
            serviceClass = Array.from(this.serviceClassMap.keys()).find(serviceClass => cls == serviceClass.name)
        }
        else {
            serviceClass = cls
        }

        if (this.serviceClassMap.has(serviceClass)) {
            const { module, options } = this.serviceClassMap.get(serviceClass)

            const service = Objects.create(serviceClass, this, module, context) as S

            if (options?.proxy) {
                return options.proxy.wrap(service)
            }
            return service
        }
        else {
            throw new Error(`${serviceClass.name} is not registered in any modules`)
        }
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
            this.serviceClassMap.set(
                serviceClass,
                {
                    module,
                    options: options?.services?.find(([cls]) => cls == serviceClass)[1]
                })
        })

        this.modules.push(module)
        return module
    }
}

export abstract class WebApplication extends Application {

    protected initialize() {
        super.initialize()

        this.addModule(ioModule, {
            http: {
                urlContext: '/io'
            },
            secured: true
        })
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
                module,
                this.composePath(path, options),
                () => module.createDataSetProcessor(path),
                options?.secured)
        })

        module.formHandlers.forEach((_value, path) => {
            this.registerFormProcessor(
                module,
                this.composePath(path, options),
                () => module.createFormProcessor(path),
                options?.secured)
        })

        module.notificationChannels.forEach((channel, name) => {
            this.registerNotificationChannel(
                module,
                this.composePath(`/sse/${name}`, options),
                channel,
                options?.secured
            )
        })

        return module
    }

    protected extendResponse(_respoonse: ServerResponse): ServerResponse & ExtendedServerResponse  {
        throw "not implemented"
    }

    getHttpContextCreator(
        module: Module) {
        return function(request: IncomingMessage, response: ServerResponse) {
            const ctx = new HttpContext(
                this,
                module,
                request,
                this.extendResponse(response),
                this.getTenantId(request)
            )
            return this.contextExtenders.reduce((c: HttpContext, e) => ({ ...c, ...e(c) }), ctx)
        }.bind(this)
    }

    abstract registerProcessor(
        module: Module,
        path: string,
        dataSetProcessor: () => DataSetProcessor,
        secured: boolean): void

    abstract registerFormProcessor(
        module: Module,
        path: string,
        formProcessor: () => FormProcessor,
        secured: boolean): void

    abstract registerNotificationChannel(
        module: Module,
        path: string,
        channel: NotificationChannel,
        secured: boolean): void
}