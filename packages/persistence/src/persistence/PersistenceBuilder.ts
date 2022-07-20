import { EntityIODefinition } from "./EntityIODefinition"
import { Persistence } from "./Persistence"
import { Transaction } from "./Transaction"
import { EntityClass, EntityProps, ItemError, ValidationHandler } from "./types"

export class PersistenceBuilder<Tx extends Transaction> {
    private lastDefinition: EntityIODefinition<unknown>

    constructor(protected persistence: Persistence) {}

    defineEntityIO<T>(
        entityClass: EntityClass<T>,
        validationHandler: ValidationHandler<T> = validator => validator): PersistenceBuilder<Tx> {
        this.lastDefinition = this.persistence.defineEntityIO(entityClass, validationHandler)
        return this
    }

    rule<T>(
        propName: string,
        expr: (changes: EntityProps, entity?: T) => boolean,
        error: ItemError) {
        this.lastDefinition.rule(propName, expr, error)
        return this
    }

    asyncRule<T>(
        propName: string,
        expr: (changes: EntityProps, entity?: T) => Promise<boolean>,
        error: ItemError) {
        this.lastDefinition.asyncRule(propName, expr, error)
        return this
    }

    create() {
        return this.persistence
    }
}