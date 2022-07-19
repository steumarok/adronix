import { Transaction } from "./Transaction";

export abstract class TransactionManager<T extends Transaction> {
    abstract createTransaction(): T

    async run<R>(
        runnable: (transaction: T) => Promise<R>) {

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
