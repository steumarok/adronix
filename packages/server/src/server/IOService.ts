import { EntityClass, EntityEventKind, EntityId, EntityIO, EntityProps, TransactionEventKind } from "@adronix/persistence/src"
import { AbstractService } from "./AbstractService"
import { Application } from "./Application"
import { Context } from "./Context"
import { InjectService } from "./InjectService"
import { NotificationService } from "./NotificationService"

type EntityType<T> = string | EntityClass<T>

export class IOService extends AbstractService {

    static readonly entityIOCreatorMap = new Map<EntityClass<unknown>, (context: Context) => EntityIO<unknown>>()

//    @InjectService
//    notificationService: NotificationService

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

    getEntityClassByName(name: string) {
        return Array.from(IOService.entityIOCreatorMap.keys()).find(c => c.name == name)
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