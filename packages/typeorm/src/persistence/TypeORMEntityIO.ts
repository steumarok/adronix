import { getConnection, getManager } from "typeorm"
import { EntityIO, EntityId } from "@adronix/persistence"
import { TypeORMTransaction } from "./TypeORMTransaction"

export class TypeORMEntityIO<T> extends EntityIO<T, TypeORMTransaction> {

    constructor(
        protected entityClass: new () => T) {
        super()
    }

    query() {
        return getManager().createQueryBuilder()
    }

    protected getEntityId(entity: T) {
        const md = getConnection().getMetadata(this.entityClass.constructor)
        const id = md.primaryColumns.map(c => c.propertyName).map(n => entity[n])
        return id.join('_')
    }

    get(id: EntityId): Promise<T> {
        return getManager().findOne(this.entityClass, id)
    }

    newEntityInstance(): T {
        return new this.entityClass()
    }

    saveEntity(entity: T, transaction: TypeORMTransaction): Promise<any> {
        return transaction.entityManager.save(entity)
    }

}