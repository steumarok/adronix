import { Transaction } from "./Transaction"
import { Errors, EntityId, EntityProps } from "./types"
import { Validator } from "./Validator"
import { Objects } from '@adronix/base'

export abstract class EntityIO<T, Tx extends Transaction> {
    abstract get(id: EntityId): Promise<T>

    protected abstract getEntityId(entity: T): EntityId

    abstract saveEntity(entity: T, transaction: Tx): Promise<any>

    abstract newEntityInstance(): T

    protected async fillEntity(transaction: Tx, entity: T, changes: EntityProps) {
        for (let key in changes) {
            const value = changes[key]
            if (typeof value == "function") {
                entity[key] = await value(transaction)
            }
            else {
                entity[key] = value
            }
        }
    }

    update(entity: T, changes: EntityProps): Errors | ((t: Tx) => Promise<any>) {
        const validator = this.validate(changes, entity)
        const errors = validator.validate()
        if (Object.keys(errors).length > 0) {
            return errors
        }
        else {
            return async (t) => {
                await this.fillEntity(t, entity, changes)
                return await this.saveEntity(entity, t)
            }
        }
    }

    insert(changes: EntityProps): Errors | ((t: Tx) => Promise<any>) {
        const validator = this.validate(changes)
        const errors = validator.validate()
        if (Object.keys(errors).length > 0) {
            return errors
        }
        else {
            return async (t) => {
                const entity = this.newEntityInstance()
                await this.fillEntity(t, entity, changes)
                return await this.saveEntity(entity, t)
            }
        }
    }

    validate(changes: EntityProps, entity?: T): Validator {
        return Objects.create(Validator)
    }
}
