import { EntityClass, EntityProps, Persistence, PersistenceBuilder, TransactionManager } from '@adronix/persistence'
import { TypeORMEntityIO } from "./TypeORMEntityIO"
import { TypeORMContext } from "./TypeORMContext"
import { TypeORMTransactionManager } from "./TypeORMTransactionManager"
import { EntityEventHandler, Rule } from "@adronix/persistence"
import { Context } from '@adronix/server'

export class GenericEntityIO<T> extends TypeORMEntityIO<T> {
    constructor(
        protected readonly transactionManagerGetter: (context: Context) => TransactionManager,
        protected readonly name: string,
        protected readonly context: TypeORMContext,
        protected readonly entityClass: new () => T,
        eventHandlers: EntityEventHandler<T>[],
        protected readonly rules: Rule[]) {

        super(
            transactionManagerGetter(context),
            context.dataSources[name],
            entityClass)

        eventHandlers.forEach(handler => this.addEventHandler(handler))
    }

    validate(
        changes: EntityProps,
        entity?: T) {

        return this.rules.reduce(
            (validator, rule) => validator.addRule(
                async () => {
                    const result = await rule.expr.call(
                        this.context,
                        changes,
                        entity,
                        rule.name,
                        this.entityClass)
                    if (!result) {
                        return { name: rule.name, error: rule.error }
                    }
                }),
            super.validate(changes, entity))

    }
}



export class TypeORMPersistence extends Persistence {

    static build(
        name: string = 'default') {
        return new PersistenceBuilder(
            () => new TypeORMPersistence(name))
    }

    protected static transactionManagerMap: Map<string, TransactionManager> = new Map()

    constructor(
        protected name: string) {
        super()
    }

    getTransactionManager() {
        return (context: TypeORMContext) => {
            const tmKey = `${this.name}_${context.tenantId || 0}`

            if (!TypeORMPersistence.transactionManagerMap.has(tmKey)) {
                TypeORMPersistence.transactionManagerMap.set(
                    tmKey,
                    new TypeORMTransactionManager(
                        context,
                        context.dataSources[this.name]))
            }

            return TypeORMPersistence.transactionManagerMap.get(tmKey)
        }
    }

    createEntityIO<T>(
        entityClass: EntityClass<T>,
        eventHandlers: EntityEventHandler<T>[],
        rules: Rule[]) {

        this.addEntityIOCreator(
            entityClass,
            (context: TypeORMContext) => new GenericEntityIO<T>(
                this.getTransactionManager(),
                this.name,
                context,
                entityClass,
                eventHandlers,
                rules))
    }
}