import { DataSource } from "typeorm"
import { EntityClass, EntityProps, Persistence, PersistenceBuilder, ValidationHandler } from '@adronix/persistence'
import { TypeORMEntityIO } from "./TypeORMEntityIO"
import { ITypeORMAware } from "./ITypeORMAware"
import { EntityIODefinition } from "@adronix/persistence/src/persistence/EntityIODefinition"

export class GenericEntityIO<T> extends TypeORMEntityIO<T> {
    constructor(
        dataSource: DataSource,
        entityClass: new () => T,
        protected readonly definition: EntityIODefinition<T>,
        protected readonly validationHandler: ValidationHandler<T>) {

        super(dataSource, entityClass)
    }

    validate(
        changes: EntityProps,
        entity?: T) {

        const validator = this.definition.addRules(
            super.validate(changes, entity),
            changes,
            entity);
        return this.validationHandler(
            validator,
            changes,
            entity)
    }
}



export class TypeORMPersistence extends Persistence {

    static build(
        manager: ITypeORMAware,
        name: string = null) {
        const persistence = new TypeORMPersistence(manager, name)
        return new PersistenceBuilder(persistence)
    }

    constructor(
        protected manager: ITypeORMAware,
        protected name: string = null) {
        super()
    }

    defineEntityIO<T>(
        entityClass: EntityClass<T>,
        validationHandler: ValidationHandler<T> = validator => validator): EntityIODefinition<T> {

        const definition = super.defineEntityIO(entityClass, validationHandler)

        const entityIO = new GenericEntityIO<T>(
            this.manager.getDataSource(this.name),
            entityClass,
            definition,
            validationHandler.bind(this))
        this.addEntityIO(
            entityClass,
            entityIO,
            this.manager.getTypeORMTransactionManager(this.name))
        return definition
    }
}