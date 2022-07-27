import { EntityClass, EntityIO, EntityProps, IPersistenceManager, Persistence, PersistenceBuilder, TransactionManager, ValidationHandler } from '@adronix/persistence'
import { TypeORMEntityIO } from "./TypeORMEntityIO"
import { ITypeORMAware } from "./ITypeORMAware"
import { TypeORMTransactionManager } from "./TypeORMTransactionManager"
import { EntityEventHandler, Rule } from "@adronix/persistence"
import { PersistenceContext } from '@adronix/persistence'

export class GenericEntityIO<T> extends TypeORMEntityIO<T> {
    constructor(
        protected readonly transactionManagerCreator: (context: PersistenceContext) => TransactionManager,
        protected readonly manager: ITypeORMAware,
        protected readonly name: string,
        protected readonly context: PersistenceContext,
        protected readonly entityClass: new () => T,
        eventHandlers: EntityEventHandler<T>[],
        protected readonly rules: Rule[]) {

        super(
            transactionManagerCreator(context),
            manager.getDataSource(context, name),
            entityClass)

        eventHandlers.forEach(handler => this.addEventHandler(handler))
    }

    validate(
        changes: EntityProps,
        entity?: T) {

        return this.rules.reduce(
            (validator, rule) => validator.addRule(
                async () => {
                    const result = await rule.expr.bind(this.manager)(this.context, changes, entity)
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

    protected transactionManagerMap: Map<string, (context: PersistenceContext) => TransactionManager> = new Map()

    constructor(
        protected manager: ITypeORMAware,
        protected name: string) {
        super()
    }

    createEntityIO<T>(
        entityClass: EntityClass<T>,
        eventHandlers: EntityEventHandler<T>[],
        rules: Rule[]) {

        const tmKey = this.name || 'default'

        if (!this.transactionManagerMap.has(tmKey)) {
            this.transactionManagerMap.set(
                tmKey,
                (context: PersistenceContext) => new TypeORMTransactionManager(
                    context,
                    this.manager.getDataSource(context, this.name)))
        }

        const tm = this.transactionManagerMap.get(tmKey)

        this.addEntityIOCreator(
            entityClass,
            (context: PersistenceContext) => new GenericEntityIO<T>(
                tm,
                this.manager,
                this.name,
                context,
                entityClass,
                eventHandlers,
                rules))

        //return entityIO
    }
}