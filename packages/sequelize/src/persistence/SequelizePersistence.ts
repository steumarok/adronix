import { Sequelize, DataTypes } from "sequelize"
import { EntityClass, EntityIO, EntityProps, Persistence, Transaction, ValidationHandler } from '@adronix/persistence'
import { SequelizeTransaction } from "./SequelizeTransaction"
import { SequelizeEntityIO } from "./SequelizeEntityIO"
import { ISequelizeManager } from "./ISequelizeManager"

export class GenericEntityIO<T> extends SequelizeEntityIO<T> {
    constructor(
        sequelize: Sequelize,
        entityClass: new () => T,
        protected readonly validationHandler: ValidationHandler<T>) {
        super(sequelize, entityClass)
    }

    validate(
        changes: EntityProps,
        entity?: T) {
        const validator = super.validate(changes, entity);
        return this.validationHandler(validator, changes, entity)
    }
}

export class SequelizePersistence extends Persistence<SequelizeTransaction> {

    constructor(
        protected manager: ISequelizeManager,
        protected name: string = null) {
        super()
    }

    defineEntityIO<T>(
        entityClass: EntityClass<T>,
        validationHandler: ValidationHandler<T>): EntityIO<T, SequelizeTransaction> {

        (entityClass as any).init({
            firstName: {
                type: DataTypes.STRING,
                allowNull: false
              },
        }, {
            sequelize: this.manager.getSequelize(),
            modelName: entityClass.prototype.constructor.name
        })

        const entityIO = new GenericEntityIO<T>(
            this.manager.getSequelize(this.name),
            entityClass,
            validationHandler.bind(this))
        this.addEntityIO(
            entityClass,
            entityIO,
            this.manager.getSequelizeTransactionManager(this.name))
        return entityIO
    }
}