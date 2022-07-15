import { EntityId, EntityIO, Transaction } from "@adronix/persistence"
import { Group } from "../entities/Group"
import { User } from "../entities/User"

const GroupDB = {
    1: new Group(1, 'developers'),
    2: new Group(1, 'managers')
}

const UserDB = {
    1: new User(2, 'steumarok', [GroupDB[1]]),
    2: new User(2, 'nasiu', [GroupDB[1], GroupDB[2]])
}

export class UserEntityIO extends EntityIO<User, Transaction> {
    async get(id: EntityId): Promise<User> {
        return UserDB[id]
    }
    getEntityId(entity: User): EntityId {
        return entity.getId()
    }
    async saveEntity(entity: User, transaction: Transaction): Promise<any> {
        if (!entity.getId()) {
            entity.id = Object.keys(UserDB).length + 1
        }
        var user = await this.get(entity.getId())
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


