import { DataSource, QueryRunner } from "typeorm"
import { EntityClass, EntityIO, EntityProps, Persistence, Transaction, ValidationHandler } from '@adronix/persistence'
import { TypeORMTransaction } from "./TypeORMTransaction"
import { TypeORMEntityIO } from "./TypeORMEntityIO"
import { ITypeORMManager } from "./ITypeORMManager"

export class GenericEntityIO<T> extends TypeORMEntityIO<T> {
    constructor(
        dataSource: DataSource,
        entityClass: new () => T,
        protected readonly validationHandler: ValidationHandler<T>) {
        super(dataSource, entityClass)
    }

    validate(
        changes: EntityProps,
        entity?: T) {
        const validator = super.validate(changes, entity);
        return this.validationHandler(validator, changes, entity)
    }
}

export class TypeORMPersistence extends Persistence<TypeORMTransaction> {

    constructor(
        protected manager: ITypeORMManager,
        protected name: string = null) {
        super()
    }

    defineEntityIO<T>(
        entityClass: EntityClass<T>,
        validationHandler: ValidationHandler<T>): EntityIO<T, TypeORMTransaction> {
        const entityIO = new GenericEntityIO<T>(
            this.manager.getDataSource(this.name),
            entityClass,
            validationHandler.bind(this))
        this.addEntityIO(
            entityClass,
            entityIO,
            this.manager.getTypeORMTransactionManager(this.name))
        return entityIO
    }
}