import { Persistence } from "./Persistence"
import { Transaction } from "./Transaction"
import { EntityClass, EntityProps, ItemError, ValidationHandler } from "./types"
import { Validator } from "./Validator"


export class EntityIODefinition<T> {

    readonly rules = []
    readonly asyncRules = []

    constructor(protected readonly persistence: Persistence) {}

    defineEntityIO<T>(
        entityClass: EntityClass<T>,
        validationHandler: ValidationHandler<T> = validator => validator): EntityIODefinition<T> {
        return this.persistence.defineEntityIO(entityClass, validationHandler)
    }

    rule(
        propName: string,
        expr: (changes: EntityProps, entity?: T) => boolean,
        error: ItemError) {
        this.rules.push({ propName, expr, error })
        return this
    }

    asyncRule(
        propName: string,
        expr: (changes: EntityProps, entity?: T) => Promise<boolean>,
        error: ItemError) {
        this.asyncRules.push({ propName, expr, error })
        return this
    }

    addRules(validator: Validator, changes: EntityProps, entity?: T) {
        const temp = this.rules.reduce(
            (validator, r) => validator.addRule(r.propName, () => r.expr(changes, entity), r.error),
            validator)
        return this.asyncRules.reduce(
            (validator, r) => validator.addAsyncRule(r.propName, async () => await r.expr(changes, entity), r.error),
            temp)
    }
}