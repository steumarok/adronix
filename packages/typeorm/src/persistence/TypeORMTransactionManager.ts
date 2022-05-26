import { TypeORMTransaction } from "./TypeORMTransaction";
import { TransactionManager } from '@adronix/persistence'
import { Objects } from '@adronix/base'

export class TypeORMTransactionManager extends TransactionManager<TypeORMTransaction> {
    createTransaction(): TypeORMTransaction {
        return Objects.create(TypeORMTransaction)
    }
}