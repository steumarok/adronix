import { EntityClass, EntityEventKind, EntityId, EntityIO, EntityProps, PersistenceContext, TransactionEventKind } from "@adronix/persistence/src"
import { AbstractService, ServiceContext } from "./AbstractService"
import { Application } from "./Application"

type EntityType<T> = string | EntityClass<T>

export class IOService extends AbstractService {

    static readonly entityIOCreatorMap = new Map<EntityClass<unknown>, (context: PersistenceContext) => EntityIO<unknown>>()


    constructor(app: Application, context: ServiceContext) {
        super(app, context)
    }

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
        entityIOCreator: (context: PersistenceContext) => EntityIO<T>) {

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
                    transaction.addEventHandler((transactionEventKind) => {
                        if (transactionEventKind == TransactionEventKind.Commit) {
                            this.app.defaultNotificationChannel.broadcast(entity, entity.constructor.name)
                        }
                    })
                }
            }) as EntityIO<T>
    }

    static get({ app, context }: { app: Application, context: ServiceContext }) {
        return app.services<IOService>(IOService, context)
    }
}