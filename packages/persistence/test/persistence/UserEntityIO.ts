import { EntityId, EntityIO, EntityProps, Transaction, Validator } from "@adronix/persistence"
import { Group } from "../entities/Group"
import { User } from "../entities/User"

export const GroupDB = { }

export const UserDB = { }

export class UserEntityIO extends EntityIO<User, Transaction> {

    deleteEntity(entity: User, transaction: Transaction): Promise<User> {
        const id = this.getEntityId(entity)
        delete UserDB[id]
        return Promise.resolve(entity)
    }
    async get(id: EntityId): Promise<User> {
        return Promise.resolve(UserDB[id] || null)
    }
    getEntityId(entity: User): EntityId {
        return entity.id
    }
    async saveEntity(entity: User, transaction: Transaction): Promise<any> {
        const id = entity.id || (Object.keys(UserDB).length + 1)

        var user = await this.get(entity.id)
        if (!user) {
            user = this.newEntityInstance()
                .withId(id)
        }
        user = user
            .withName(entity.name)

        UserDB[id] = user

        return Promise.resolve(user)
    }
    newEntityInstance(): User {
        return new User()
    }

    validate(changes: EntityProps, entity?: User): Validator {
        return super.validate(changes, entity)
            .addRule('name', () => !!changes.name, { message: 'empty' })
    }

}


