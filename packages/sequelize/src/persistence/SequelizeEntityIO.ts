import { Sequelize }  from 'sequelize'
import { EntityIO, EntityId } from "@adronix/persistence"
import { SequelizeTransaction } from "./SequelizeTransaction"

export class SequelizeEntityIO<T> extends EntityIO<T> {

    constructor(
        protected sequelize: Sequelize,
        protected entityClass: new () => T) {
        super()
    }

    getEntityId(entity: T) {
       return (entity as any).id
    }

    get(id: EntityId): Promise<T> {
        return (this.entityClass as any).findByPk(id)
    }

    newEntityInstance(): T {
        return new this.entityClass()
    }

    saveEntity(entity: T, transaction: SequelizeTransaction): Promise<any> {
        return (entity as any).save()
    }

    deleteEntity(entity: T, transaction: SequelizeTransaction): Promise<any> {
        return null
    }

}