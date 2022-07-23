import { Sequelize } from "sequelize"
import { EntityClass, EntityProps, Persistence, TransactionManager, ValidationHandler } from '@adronix/persistence'
import { SequelizeEntityIO } from "./SequelizeEntityIO"
import { ISequelizeAware } from "./ISequelizeAware"
import { EntityIODefinition } from "@adronix/persistence/src/persistence/EntityIODefinition"
import { SequelizeTransactionManager } from "./SequelizeTransactionManager"

export class GenericEntityIO<T> extends SequelizeEntityIO<T> {
    constructor(
        sequelize: Sequelize,
        entityClass: new () => T,
        protected readonly definition: EntityIODefinition<T>,
        protected readonly validationHandler: ValidationHandler<T>) {
        super(sequelize, entityClass)
    }

    validate(
        changes: EntityProps,
        entity?: T) {
        const validator = this.definition.addRules(super.validate(changes, entity), changes, entity);
        return this.validationHandler(validator, changes, entity)
    }
}

export class SequelizePersistence extends Persistence {

    static transactionManagers: Map<String, TransactionManager> = new Map()

    constructor(
        protected manager: ISequelizeAware,
        protected name: string = null) {
        super()
    }

    defineEntityIO<T>(
        entityClass: EntityClass<T>,
        validationHandler: ValidationHandler<T> = validator => validator): EntityIODefinition<T> {

        const definition = super.defineEntityIO(entityClass, validationHandler)
        const sequelize = this.manager.getSequelize(this.name)

        if (!SequelizePersistence.transactionManagers.has(this.name)) {
            SequelizePersistence.transactionManagers.set(
                this.name,
                new SequelizeTransactionManager(sequelize))
        }

        const entityIO = new GenericEntityIO<T>(
            sequelize,
            entityClass,
            definition,
            validationHandler.bind(this))
        this.addEntityIO(
            entityClass,
            entityIO,
            SequelizePersistence.transactionManagers.get(this.name))
        return definition
    }
}