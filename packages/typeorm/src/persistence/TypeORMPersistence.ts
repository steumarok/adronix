import { EntityClass, EntityIO, EntityProps, IPersistenceManager, Persistence, PersistenceBuilder, TransactionManager, ValidationHandler } from '@adronix/persistence'
import { TypeORMEntityIO } from "./TypeORMEntityIO"
import { ITypeORMAware } from "./ITypeORMAware"
import { TypeORMTransactionManager } from "./TypeORMTransactionManager"
import { Rule } from "@adronix/persistence/src/persistence/types"

export class GenericEntityIO<T> extends TypeORMEntityIO<T> {
    constructor(
        protected manager: ITypeORMAware,
        entityClass: new () => T,
        protected readonly rules: Rule[]) {

        super(manager.getDataSource(), entityClass)
    }

    validate(
        changes: EntityProps,
        entity?: T) {

        return this.rules.reduce(
            (validator, rule) => validator.addRule(
                async () => {
                    const result = await rule.expr.bind(this.manager)(changes, entity)
                    if (!result) {
                        return { name: rule.name, error: rule.error }
                    }
                }),
            super.validate(changes, entity))

    }
}



export class TypeORMPersistence extends Persistence {

    static transactionManagers: Map<String, TransactionManager> = new Map()

    static build(
        name: string = 'default') {
        return new PersistenceBuilder(
            manager => new TypeORMPersistence(manager as ITypeORMAware, name))
    }


    constructor(
        protected manager: ITypeORMAware,
        protected name: string) {
        super()
    }

    createEntityIO<T>(
        entityClass: EntityClass<T>,
        rules: Rule[]): EntityIO<T> {

        const dataSource = this.manager.getDataSource(this.name)

        if (!TypeORMPersistence.transactionManagers.has(this.name)) {
            TypeORMPersistence.transactionManagers.set(
                this.name,
                new TypeORMTransactionManager(dataSource))
        }

        const entityIO = new GenericEntityIO<T>(
            this.manager,
            entityClass,
            rules)

        this.addEntityIO(
            entityClass,
            entityIO,
            TypeORMPersistence.transactionManagers.get(this.name))

        return entityIO
    }
}