import { Transaction } from "./Transaction"
import { Errors, EntityId, EntityProps, EntityEventHandler, EntityEventKind } from "./types"
import { Validator } from "./Validator"
import { Objects } from '@adronix/base'

export abstract class EntityIO<T, Tx extends Transaction> {

    private eventHandlers: EntityEventHandler<T, Tx>[] = []

    abstract get(
        id: EntityId): Promise<T>

    abstract getEntityId(
        entity: T): EntityId

    abstract saveEntity(
        entity: T,
        transaction: Tx): Promise<T>

    abstract deleteEntity(
        entity: T,
        transaction: Tx): Promise<T>

    abstract newEntityInstance(): T

    protected async fillEntity(
        transaction: Tx,
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

    delete(
        entity: T): (t: Tx) => Promise<void> {

        return async (t: Tx) => {
            await this.notify(EntityEventKind.Deleting, entity, t)

            const result =  await this.deleteEntity(entity, t)

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
            return async (t: Tx) => {
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
            return async (t: Tx) => {
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
        transaction: Tx) {

        return Promise.all(
            this.eventHandlers.map(handler => handler(eventKind, entity, transaction))
        )
    }

    addEventHandler(
        handler: EntityEventHandler<T, Tx>) {

        this.eventHandlers.push(handler)
    }
}
