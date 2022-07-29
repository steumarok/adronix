import { DataSource } from "typeorm"
import { EntityIO, EntityId, TransactionManager } from "@adronix/persistence"
import { TypeORMTransaction } from "./TypeORMTransaction"

export class TypeORMEntityIO<T> extends EntityIO<T> {

    constructor(
        transactionManager: TransactionManager,
        protected readonly dataSource: DataSource,
        protected readonly entityClass: new () => T) {
        super(transactionManager)
    }

    query() {
        return this.dataSource.manager.createQueryBuilder()
    }

    getEntityId(entity: T) {
        const md = this.dataSource.getMetadata(this.entityClass)
        const id = md.primaryColumns.map(c => c.propertyName).map(n => entity[n])
        return id.length == 1 ? id[0] : id
    }

    async get(id: EntityId): Promise<T> {
        return this.dataSource.manager.createQueryBuilder(this.entityClass, "e")
            .where("e.id = :id", { id })
            .getOne()
    }

    newEntityInstance(): T {
        return new this.entityClass()
    }

    saveEntity(entity: T, transaction: TypeORMTransaction): Promise<any> {
        return transaction.entityManager.save(entity)
    }

    deleteEntity(entity: T, transaction: TypeORMTransaction): Promise<any> {
        return transaction.entityManager.remove(entity)
    }

}