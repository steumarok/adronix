import { Context } from "packages/server"
import { EntityIO } from "./EntityIO"
import { EntityClass, EntityEventHandler, Rule } from "./types"


export abstract class Persistence {

    public readonly entityIOCreatorMap
        = new Map<EntityClass<unknown>, (context: Context) => EntityIO<unknown>>()

    abstract createEntityIO<T>(
        entityClass: EntityClass<T>,
        eventHandlers: EntityEventHandler<T>[],
        rules: Rule[]): void

    protected addEntityIOCreator<T>(
        entityClass: EntityClass<T>,
        entityIOCreator: (context: Context) => EntityIO<unknown>) {
        this.entityIOCreatorMap.set(entityClass, entityIOCreator)
    }

}