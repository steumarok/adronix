import { EntityClass, EntityIO, EntityProps, IPersistenceManager, Persistence, PersistenceBuilder, TransactionManager, ValidationHandler } from '@adronix/persistence'
import { TypeORMEntityIO } from "./TypeORMEntityIO"
import { ITypeORMAware } from "./ITypeORMAware"
import { TypeORMTransactionManager } from "./TypeORMTransactionManager"
import { EntityEventHandler, Rule } from "@adronix/persistence"
import { PersistenceContext } from '@adronix/persistence'
import { RuleThis } from '@adronix/persistence'

export class GenericEntityIO<T> extends TypeORMEntityIO<T> {
    constructor(
        protected readonly transactionManagerGetter: (context: PersistenceContext) => TransactionManager,
        protected readonly manager: ITypeORMAware,
        protected readonly name: string,
        protected readonly context: PersistenceContext,
        protected readonly entityClass: new () => T,
        eventHandlers: EntityEventHandler<T>[],
        protected readonly rules: Rule[]) {

        super(
            transactionManagerGetter(context),
            manager.getDataSource(context, name),
            entityClass)

        eventHandlers.forEach(handler => this.addEventHandler(handler))
    }

    validate(
        changes: EntityProps,
        entity?: T) {

        const this_: RuleThis = {
            manager: this.manager,
            context: this.context
        }

        return this.rules.reduce(
            (validator, rule) => validator.addRule(
                async () => {
                    const result = await rule.expr.bind(this_)(changes, entity)
                    if (!result) {
                        return { name: rule.name, error: rule.error }
                    }
                }),
            super.validate(changes, entity))

    }
}



export class TypeORMPersistence extends Persistence {

    static build(
        name: string = null) {
        return new PersistenceBuilder(
            manager => new TypeORMPersistence(manager as ITypeORMAware, name))
    }

    protected static transactionManagerMap: Map<string, TransactionManager> = new Map()

    constructor(
        protected manager: ITypeORMAware,
        protected name: string) {
        super()
    }

    getTransactionManager() {
        return (context: PersistenceContext) => {
            const tmKey = `${this.name || 'default'}_${context.tenantId || 0}`

            if (!TypeORMPersistence.transactionManagerMap.has(tmKey)) {
                TypeORMPersistence.transactionManagerMap.set(
                    tmKey,
                    new TypeORMTransactionManager(
                        context,
                        this.manager.getDataSource(context, this.name)))
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
            (context: PersistenceContext) => new GenericEntityIO<T>(
                this.getTransactionManager(),
                this.manager,
                this.name,
                context,
                entityClass,
                eventHandlers,
                rules))
    }
}