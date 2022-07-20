import { EntityIO } from "./EntityIO"
import { EntityIODefinition } from "./EntityIODefinition"
import { Transaction } from "./Transaction"
import { TransactionManager } from "./TransactionManager"
import { EntityClass, EntityProps, TransactionEventHandler, TransactionEventKind, ValidationHandler } from "./types"


export abstract class Persistence {

    public readonly entityIOMap = new Map<EntityClass<unknown>, {
        entityIO: EntityIO<unknown>,
        transactionManager: TransactionManager
    }>()

    defineEntityIO<T>(
        entityClass: EntityClass<T>,
        validationHandler: ValidationHandler<T> = (validator) => validator): EntityIODefinition<T> {
        return new EntityIODefinition(this)
    }

    addEntityIO<T>(
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