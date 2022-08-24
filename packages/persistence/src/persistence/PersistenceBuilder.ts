import { Persistence } from "./Persistence"
import { Error } from "@adronix/base"
import { AsyncRuleExpr, EntityClass, EntityEventHandler, EntityIODefinitions, EntityIORules, Rule, RuleExpr } from "./types"


export interface IPersistenceExtender {
    addEventHandler<T>(
        entityClass: EntityClass<T>,
        handler: EntityEventHandler<T>): IPersistenceExtender;
}

export class PersistenceBuilder implements IPersistenceExtender {
    private lastEntityClass: EntityClass<unknown>
    private entityClassMap: Map<EntityClass<unknown>, { rules: Rule[] }> = new Map()
    private eventHandlers: { entityClass: EntityClass<unknown>, handler: EntityEventHandler<unknown> }[] = []

    constructor(private persistenceCreator: () => Persistence) { }

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
                    this.denormalizeRules(definition.rules) :
                    [])
        })
        return this
    }

    private denormalizeRules(rules: EntityIORules) {
        return Object.entries(rules)
            .reduce((arr, rule) => arr.concat(
                (Array.isArray(rule[1]) ? rule[1] : [rule[1]])
                    .map(s => ({name: rule[0], expr: s[0], error: s[1]}))), [])
    }

    rule(
        name: string,
        expr: RuleExpr | AsyncRuleExpr,
        error: Error) {

        const rule = { name, expr, error }
        this.entityClassMap.get(this.lastEntityClass).rules.push(rule)
        return this
    }

    rules(rules: { name: string, expr: RuleExpr | AsyncRuleExpr, error: Error }[]) {
        rules.forEach(({name, expr, error}) => {
            this.rule(name, expr, error)
        })
    }

    create() {
        const persistence = this.persistenceCreator()

        this.entityClassMap.forEach(({ rules }, entityClass) => {
            persistence.createEntityIO(
                entityClass,
                this.eventHandlers.filter(e => e.entityClass == entityClass).map(e => e.handler),
                rules)
        })

        return persistence
    }

    addEventHandler<T>(
        entityClass: EntityClass<T>,
        handler: EntityEventHandler<T>
    ): PersistenceBuilder {
        this.eventHandlers.push({ entityClass, handler })
        return this
    }
}


