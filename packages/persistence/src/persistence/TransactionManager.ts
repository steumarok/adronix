import { Transaction } from "./Transaction";

export abstract class TransactionManager {
    abstract createTransaction(): Transaction

    async run<R>(
        runnable: (transaction: Transaction) => Promise<R>) {

        const transaction = this.createTransaction()

        try {
            await transaction.start()

            const result = await runnable(transaction)

            await transaction.commit()

            return result
        }
        catch (e) {

            await transaction.rollback()

            throw e;
        }
    }
}
