import { EntityIO } from "./EntityIO"
import { TransactionManager } from "./TransactionManager"
import { EntityClass, Rule } from "./types"


export abstract class Persistence {

    public readonly entityIOMap = new Map<EntityClass<unknown>, {
        entityIO: EntityIO<unknown>,
        transactionManager: TransactionManager
    }>()

    abstract createEntityIO<T>(
        entityClass: EntityClass<T>,
        rules: Rule[]): EntityIO<T>

    protected addEntityIO<T>(
        entityClass: EntityClass<T>,
        entityIO: EntityIO<T>,
        transactionManager: TransactionManager) {
        this.entityIOMap.set(entityClass, { entityIO, transactionManager })
    }

    getEntityIO(entityClass: EntityClass<unknown>): EntityIO<unknown> {
        const { entityIO } = this.entityIOMap.get(entityClass)
        return entityIO
    }

}