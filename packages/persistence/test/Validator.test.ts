import { Transaction, TransactionManager, Validator } from '../src'
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

describe("Validator tests", () => {

    it("should single rule fail", async () => {
        const errors = await new Validator()
            .addRule('name', () => false, { code: 'NAME_ERROR', message: 'failure' })
            .validate()

        expect(errors).toStrictEqual({ name: [ { code: 'NAME_ERROR', message: 'failure' } ] })
    })

    it("should single async rule fail", async () => {
        const errors = await new Validator()
            .addAsyncRule('name', async () => false, { code: 'NAME_ERROR', message: 'failure' })
            .validate()

        expect(errors).toStrictEqual({ name: [ { code: 'NAME_ERROR', message: 'failure' } ] })
    })

    it("should sync and async rule fail", async () => {
        const errors = await new Validator()
            .addRule('name', () => false, { code: 'NAME_ERROR_1', message: 'failure' })
            .addAsyncRule('name', async () => false, { code: 'NAME_ERROR_2', message: 'failure' })
            .validate()

        expect(errors).toEqual({ name: [ { code: 'NAME_ERROR_1', message: 'failure' }, { code: 'NAME_ERROR_2', message: 'failure' } ] })
    })

    it("should two rule fail", async () => {
        const errors = await new Validator()
            .addRule('name', () => false, { code: 'NAME_ERROR', message: 'failure' })
            .addRule('email', () => false, { code: 'EMAIL_ERROR', message: 'failure' })
            .validate()

        expect(errors).toStrictEqual({ name: [ { code: 'NAME_ERROR', message: 'failure' } ], email: [ { code: 'EMAIL_ERROR', message: 'failure' } ] })
    })
})

