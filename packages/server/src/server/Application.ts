import { EntityClass, EntityIO, IPersistenceManager, Transaction, TransactionEventKind, TransactionManager } from "@adronix/persistence/src"
import { EntityEventKind } from "@adronix/persistence"
import { BetterSseNotificationChannel } from "./BetterSseNotificationChannel"
import { DataSetProcessor } from "./DataSetProcessor"
import { Module } from "./Module"
import { NotificationChannel } from "./NotificationChannel"
import { Objects } from "@adronix/base/src"
import { ModuleOptions } from "./types"

export abstract class Application implements IPersistenceManager {
    readonly modules: Module<Application>[] = []
    readonly defaultNotificationChannel: NotificationChannel  = new BetterSseNotificationChannel()

    public readonly entityIOMap = new Map<EntityClass<unknown>, {
        entityIO: EntityIO<unknown>,
        transactionManager: TransactionManager
    }>()


    constructor() {
    }

    getEntityIOMap() {
        return this.entityIOMap
    }

    addEntityIO<T>(
        entityClass: EntityClass<T>,
        entityIO: EntityIO<T>,
        transactionManager: TransactionManager) {

        this.entityIOMap.set(entityClass, { entityIO, transactionManager })

        entityIO.addEventHandler(async (entityEventKind, entity, transaction) => {
            if (entityEventKind == EntityEventKind.Deleted ||
                entityEventKind == EntityEventKind.Updated ||
                entityEventKind == EntityEventKind.Inserted) {
                transaction.addEventHandler((transactionEventKind) => {
                    if (transactionEventKind == TransactionEventKind.Commit) {
                        this.defaultNotificationChannel.broadcast(entity, entity.constructor.name)
                    }
                })
            }
        })
    }

    getEntityClassByName(name: string) {
        return Array.from(this.getEntityIOMap().keys()).find(c => c.name == name)
    }

    getEntityIO(type: string | EntityClass<unknown>): EntityIO<unknown> {
        const entityClass = typeof type == "string" ? this.getEntityClassByName(type) : type
        const { entityIO } = this.getEntityIOMap().get(entityClass)
        return entityIO
    }


    setDefaultNotificationChannel(path: string) {
        this.registerNotificationChannel(path, this.defaultNotificationChannel)
    }

    addNotificationChannel(path: string): NotificationChannel {
        const channel = new BetterSseNotificationChannel()
        this.registerNotificationChannel(path, channel)
        return channel
    }

    addModule(
        moduleClass: new (app: Application) => Module<Application>,
        options?: ModuleOptions) {
        this.modules.push(Objects.create(moduleClass, this, options))
    }

    abstract registerProcessor(
        path: string,
        dataSetProcessor: () => DataSetProcessor): void

    abstract registerNotificationChannel(
        path: string,
        channel: NotificationChannel): void
}