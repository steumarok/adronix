import { IPersistenceManager } from "@adronix/persistence"
import { BetterSseNotificationChannel } from "./BetterSseNotificationChannel"
import { DataSetProcessor } from "./DataSetProcessor"
import { Module } from "./Module"
import { NotificationChannel } from "./NotificationChannel"
import { Objects } from "@adronix/base/src"
import { ModuleOptions } from "./types"
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
    readonly modules: Module<Application>[] = []
    readonly defaultNotificationChannel: NotificationChannel  = new BetterSseNotificationChannel()

    protected readonly serviceMap: Map<String, AbstractService<Application>> = new Map();

    constructor() {
    }

    setDefaultNotificationChannel(path: string) {
        this.registerNotificationChannel(path, this.defaultNotificationChannel, false)
    }

    addNotificationChannel(path: string, secured: boolean): NotificationChannel {
        const channel = new BetterSseNotificationChannel()
        this.registerNotificationChannel(path, channel, secured)
        return channel
    }

    addModule(
        moduleClass: new (app: Application) => Module<Application>,
        options?: ModuleOptions) {
        this.modules.push(Objects.create(moduleClass, this, options))
    }

    services<S extends AbstractService<Application>>(
        cls: typeof AbstractService<Application>,
        context: ServiceContext): S {
        return Objects.create(cls, this, context) as S
    }

    registerService(cls: typeof AbstractService<Application>) {
        const name = cls.prototype.constructor.name
        //this.serviceMap.set(name, Objects.create(cls, this))
    }

    getTenantId(request: IncomingMessage): string {
        return null
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