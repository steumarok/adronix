import { Transaction } from "./Transaction"
import { EntityId, EntityProps, EntityEventHandler, EntityEventKind } from "./types"
import { Objects, Validator, Errors } from '@adronix/base'
import { TransactionManager } from "./TransactionManager"

export abstract class EntityIO<T> {

    private eventHandlers: EntityEventHandler<T>[] = []

    constructor(public readonly transactionManager: TransactionManager) {}

    abstract get(
        id: EntityId): Promise<T>

    abstract getEntityId(
        entity: T): EntityId

    abstract saveEntity(
        entity: T,
        transaction: Transaction): Promise<T>

    abstract deleteEntity(
        entity: T,
        transaction: Transaction): Promise<T>

    abstract newEntityInstance(): T

    protected async fillEntity(
        transaction: Transaction,
        entity: T,
        changes: EntityProps) {

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

    async delete(
        entity: T): Promise<Errors | ((tx: Transaction) => Promise<void>)> {

        return async (t: Transaction) => {
            await this.notify(EntityEventKind.Deleting, entity, t)

            /*const result =*/ await this.deleteEntity(entity, t)

            await this.notify(EntityEventKind.Deleted, entity, t)
        }
    }

    async update(
        entity: T,
        changes: EntityProps) {

        const validator = this.validate(changes, entity)
        const errors = await validator.validate()
        if (Object.keys(errors).length > 0) {
            return errors
        }
        else {
            return async (t: Transaction) => {
                await this.fillEntity(t, entity, changes)

                await this.notify(EntityEventKind.Updating, entity, t)

                const result =  await this.saveEntity(entity, t)

                await this.notify(EntityEventKind.Updated, result, t)

                return result
            }
        }
    }

    async insert(
        changes: EntityProps) {

        const validator = this.validate(changes)
        const errors = await validator.validate()
        if (Object.keys(errors).length > 0) {
            return errors
        }
        else {
            return async (t: Transaction) => {
                const entity = this.newEntityInstance()

                await this.fillEntity(t, entity, changes)

                await this.notify(EntityEventKind.Inserting, entity, t)

                const result = await this.saveEntity(entity, t)

                await this.notify(EntityEventKind.Inserted, result, t)

                return result
            }
        }
    }

    validate(
        changes: EntityProps,
        entity?: T): Validator {

        return Objects.create(Validator)
    }

    protected async notify(
        eventKind: EntityEventKind,
        entity: T,
        transaction: Transaction) {

        for (const handler of this.eventHandlers) {
            await handler(eventKind, entity, transaction)
        }
    }

    addEventHandler(
        handler: EntityEventHandler<T>) {

        this.eventHandlers.push(handler)

        return this
    }
}
