import { IPersistenceManager } from "./IPersistenceManager"
import { Persistence } from "./Persistence"
import { ItemError } from "@adronix/base"
import { AsyncRuleExpr, EntityClass, EntityEventHandler, EntityIODefinitions, Rule, RuleExpr } from "./types"


export interface IPersistenceExtender {
    addEventHandler<T>(
        entityClass: EntityClass<T>,
        handler: EntityEventHandler<T>): IPersistenceExtender;
}

export class PersistenceBuilder implements IPersistenceExtender {
    private lastEntityClass: EntityClass<unknown>
    private entityClassMap: Map<EntityClass<unknown>, { rules: Rule[] }> = new Map()
    private eventHandlers: { entityClass: EntityClass<unknown>, handler: EntityEventHandler<unknown> }[] = []

    constructor(private persistenceCreator: (manager: IPersistenceManager) => Persistence) { }

    defineEntityIO<T>(
        entityClass: EntityClass<T>): PersistenceBuilder {

        this.lastEntityClass = entityClass
        this.entityClassMap.set(entityClass, { rules: [] })
        return this
    }

    addDefinitions(definitions: EntityIODefinitions) {
        definitions.forEach(definition => {
            this.defineEntityIO(definition.entityClass)
                .rules(definition.rules ?
                    definition.rules.map(r => ({ name: r[0], expr: r[1], error: r[2] })) :
                    [])
        })
        return this
    }

    rule(
        name: string,
        expr: RuleExpr | AsyncRuleExpr,
        error: ItemError) {

        const rule = { name, expr, error }
        this.entityClassMap.get(this.lastEntityClass).rules.push(rule)
        return this
    }

    rules(rules: { name: string, expr: RuleExpr | AsyncRuleExpr, error: ItemError }[]) {
        rules.forEach(({name, expr, error}) => {
            this.rule(name, expr, error)
        })
    }

    create(manager: IPersistenceManager) {
        const persistence = this.persistenceCreator(manager)

        this.entityClassMap.forEach(({ rules }, entityClass) => {
            persistence.createEntityIO(
                entityClass,
                this.eventHandlers.filter(e => e.entityClass == entityClass).map(e => e.handler),
                rules)
        })

        /*this.eventHandlers.forEach(({entityClass, handler}) => {
            persistence.getEntityIO(entityClass).addEventHandler(handler.bind(manager))
        })*/

        return persistence
    }

    addEventHandler<T>(
        entityClass: EntityClass<T>,
        handler: EntityEventHandler<T>): IPersistenceExtender {

        this.eventHandlers.push({ entityClass, handler })
        return this
    }
}


