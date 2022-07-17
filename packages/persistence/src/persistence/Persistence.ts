import { EntityIO } from "./EntityIO"
import { Transaction } from "./Transaction"
import { TransactionManager } from "./TransactionManager"
import { EntityClass, EntityProps, TransactionEventHandler, TransactionEventKind, ValidationHandler } from "./types"


export abstract class Persistence<Tx extends Transaction> {

    public readonly entityIOMap = new Map<EntityClass<unknown>, {
        entityIO: EntityIO<unknown, Transaction>,
        transactionManager: TransactionManager<Transaction>
    }>()

    abstract defineEntityIO<T>(
        entityClass: EntityClass<T>,
        validationHandler: ValidationHandler<T>): EntityIO<T, Tx>;

    addEntityIO<T>(
        entityClass: EntityClass<T>,
        entityIO: EntityIO<T, Tx>,
        transactionManager: TransactionManager<Tx>) {
        this.entityIOMap.set(entityClass, { entityIO, transactionManager })
    }
}