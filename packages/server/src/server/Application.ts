import { EntityClass, EntityIO, Transaction, TransactionEventKind, TransactionManager } from "@adronix/persistence/src"
import { EntityEventKind } from "@adronix/persistence"
import { BetterSseNotificationChannel } from "./BetterSseNotificationChannel"
import { DataSetProcessor } from "./DataSetProcessor"
import { Module } from "./Module"
import { NotificationChannel } from "./NotificationChannel"

export abstract class Application {
    modules: Module<Application>[] = []

    public readonly entityIOMap = new Map<EntityClass<unknown>, {
        entityIO: EntityIO<unknown, Transaction>,
        transactionManager: TransactionManager<Transaction>
    }>()


    constructor() {
    }

    getEntityIOMap() {
        return this.entityIOMap
    }

    addEntityIO<T, Tx extends Transaction>(
        entityClass: EntityClass<T>,
        entityIO: EntityIO<T, Tx>,
        transactionManager: TransactionManager<Tx>) {
        this.entityIOMap.set(entityClass, { entityIO, transactionManager })

        entityIO.addEventHandler((entityEventKind, entity, transaction) => {
            transaction.addEventHandler((transactionEventKind) => {
                if (transactionEventKind == TransactionEventKind.Commit) {
                    this.channel.broadcast(entity, `${entityEventKind}`)
                }
            })
        })
    }

    channel: NotificationChannel
    addNotificationChannel(path: string): NotificationChannel {
        const channel = new BetterSseNotificationChannel()
        this.registerNotificationChannel(path, channel)
        this.channel = channel
        return channel
    }

    addModule<A extends Application>(module: Module<A>) {
        this.modules.push(module)
    }

    abstract registerProcessor(
        path: string,
        dataSetProcessor: () => DataSetProcessor): void

    abstract registerNotificationChannel(
        path: string,
        channel: NotificationChannel): void
}