import { EntityIO } from "./EntityIO"
import { PersistenceContext } from "./PersistenceContext"
import { TransactionManager } from "./TransactionManager"
import { EntityClass, EntityEventHandler, Rule } from "./types"


export abstract class Persistence {

    public readonly entityIOCreatorMap = new Map<EntityClass<unknown>, (context: PersistenceContext) => EntityIO<unknown>>()

    abstract createEntityIO<T>(
        entityClass: EntityClass<T>,
        eventHandlers: EntityEventHandler<T>[],
        rules: Rule[]): void

    protected addEntityIOCreator<T>(
        entityClass: EntityClass<T>,
        entityIOCreator: (context: PersistenceContext) => EntityIO<unknown>) {
        this.entityIOCreatorMap.set(entityClass, entityIOCreator)
    }

}