import { Transaction, TransactionManager } from '../src'
import { Group } from './entities/Group'
import { User } from './entities/User'
import { GroupDB, UserDB, UserEntityIO } from './persistence/UserEntityIO'


class TestTransaction extends Transaction {

}

class TestTransactionManager extends TransactionManager<TestTransaction> {
    createTransaction(): TestTransaction {
        return new TestTransaction()
    }
}

beforeEach(() => {

    GroupDB[1] = new Group(1, 'developers')
    GroupDB[2] = new Group(2, 'developers')

    UserDB[1] = new User(1, 'steumarok', [GroupDB[1]])
    UserDB[2] = new User(2, 'nasiu', [GroupDB[1], GroupDB[2]])

    global.transactionManager = new TestTransactionManager()
})

afterEach(() => {
})

function getTransactionManager() {
    return global.transactionManager as TestTransactionManager
}

describe("EntityIO query tests", () => {

    it("should return a user with name steumarok", async () => {
        const io = new UserEntityIO()
        const user1 = await io.get(1)

        expect(user1?.name).toEqual("steumarok")
    })
})

describe("EntityIO raw crud tests", () => {

    it("should insert a user", async () => {
        const io = new UserEntityIO()
        const user = new User()
            .withName('pippuz')

        const insertedUser = await getTransactionManager().run(t => {
            return io.saveEntity(user, t)
        })

        expect(insertedUser).not.toBeNull()
        expect(insertedUser?.name).toEqual("pippuz")
    })

    it("should delete a user", async () => {
        const io = new UserEntityIO()
        const user = await io.get(1)

        await getTransactionManager().run(t => {
            return io.deleteEntity(user, t)
        })

        const deletedUser = await io.get(1)

        expect(deletedUser).toBeNull()
    })

    it("should update a user", async () => {
        const io = new UserEntityIO()
        const user = (await io.get(2))
            .withName('carlin')

        const updatedUser = await getTransactionManager().run(t => {
            return io.saveEntity(user, t)
        })

        expect(updatedUser).not.toBeNull()
        expect(updatedUser?.name).toEqual('carlin')
    })
})