import { EntityClass, EntityEventKind, EntityId, EntityIO, EntityProps, Transaction, TransactionEventKind } from "@adronix/persistence/src"
import { Errors } from "packages/base/src"
import { AbstractService } from "./AbstractService"
import { Context } from "./Context"

type EntityType<T> = string | EntityClass<T>

class Throwing {
    constructor(private ioService: IOService) { }

    private makeThrowing<R>(res: Promise<Errors | ((t: Transaction) => Promise<R>)>)
        : (t: Transaction) => Promise<R> {
        return async (t) => {
            const r = await res
            if (typeof r == "object") {
                throw r
            } else {
                return await r(t)
            }
        }
    }

    insert<T>(
        type: EntityType<T>,
        changes: EntityProps) {
        return this.makeThrowing(this.ioService.insert(type, changes))
    }

    delete<T>(type: EntityType<T>, entity: T) {
        return this.makeThrowing(this.ioService.delete(type, entity))
    }

    update<T>(
        type: EntityType<T>,
        entity: T,
        changes: EntityProps) {
        return this.makeThrowing(this.ioService.update(type, entity, changes))
    }
}

export class IOService extends AbstractService {

    static readonly entityIOCreatorMap = new Map<EntityClass<unknown>, (context: Context) => EntityIO<unknown>>()

    readonly throwing = new Throwing(this)

    getTransactionManager<T>(type: EntityType<T>) {
        return this.getEntityIO<T>(type).transactionManager
    }

    get<T>(type: EntityType<T>, id: EntityId): Promise<T> {
        return this.getEntityIO<T>(type).get(id)
    }

    getEntityId<T>(type: EntityType<T>, entity: T): EntityId {
        return this.getEntityIO<T>(type).getEntityId(entity)
    }

    getEntityClasses() {
        return Array.from(IOService.entityIOCreatorMap.keys())
    }

    delete<T>(type: EntityType<T>, entity: T) {
        return this.getEntityIO<T>(type).delete(entity)
    }

    update<T>(
        type: EntityType<T>,
        entity: T,
        changes: EntityProps) {
        return this.getEntityIO<T>(type).update(entity, changes)
    }

    insert<T>(
        type: EntityType<T>,
        changes: EntityProps) {
        return this.getEntityIO<T>(type).insert(changes)
    }


    static addEntityIOCreator<T>(
        entityClass: EntityClass<T>,
        entityIOCreator: (context: Context) => EntityIO<T>) {

        IOService.entityIOCreatorMap.set(entityClass, entityIOCreator)
    }

    getEntityClassByName(name: string): EntityClass<unknown> {
        const result = Array.from(IOService.entityIOCreatorMap.keys()).find(c => c.name == name)

        if (!result) {
            throw new Error(`Entity '${name}' not managed`)
        }

        return result
    }

    getEntityClass<T>(type: EntityType<T>): EntityClass<unknown> {
        return typeof type == "string" ? this.getEntityClassByName(type) : type
    }

    getEntityIO<T>(type: EntityType<T>): EntityIO<T> {
        const entityClass = this.getEntityClass(type)
        const entityIOCreator = IOService.entityIOCreatorMap.get(entityClass)

        return entityIOCreator(this.context)
            .addEventHandler(async (entityEventKind, entity, transaction) => {
                if (entityEventKind == EntityEventKind.Deleted ||
                    entityEventKind == EntityEventKind.Updated ||
                    entityEventKind == EntityEventKind.Inserted) {
                    transaction.addEventHandler(async (transactionEventKind) => {
                        if (transactionEventKind == TransactionEventKind.Commit) {
                            this.module.notificationChannels.get('data').broadcast(entity, entity.constructor.name)
                            //this.notificationService.broadcast('io', entity.constructor.name, entity)
                            //this.app.defaultNotificationChannel.broadcast(entity, entity.constructor.name)
                        }
                    })
                }
            }) as EntityIO<T>
    }

}