import { createConnection, getConnection } from 'typeorm'
import { EntityIO } from '../src/entity-io/EntityIO'
import { Transaction } from '../src/entity-io/Transaction'
import { ItemId } from '../src/types'
import { Group } from './entities/Group'
import { User } from './entities/User'



class UserEntityIO extends EntityIO<User, Transaction> {
    async get(id: ItemId): Promise<User> {
        return UserDB[id]
    }
    protected getEntityId(entity: User): ItemId {
        return entity.id
    }
    async saveEntity(entity: User, transaction: Transaction): Promise<any> {
        if (!entity.id) {
            entity.id = Object.keys(UserDB).length + 1
        }
        var user = await this.get(entity.id)
        if (!user) {
            user = this.newEntityInstance()
        }
        user.name = entity.name
        return Promise.resolve(user)
    }
    newEntityInstance(): User {
        return new User()
    }

}

describe("EntityIO tests", () => {
    it("should return a user with name Steu", async () => {
        const io = new UserEntityIO()
        const user1 = await io.get(1)

        expect(user1?.name).toEqual("Steu")
    })
})