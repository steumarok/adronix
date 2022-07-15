import { TypeORMTransaction } from "./TypeORMTransaction";
import { TransactionManager } from '@adronix/persistence'
import { Objects } from '@adronix/base'
import { DataSource } from "typeorm";

export class TypeORMTransactionManager extends TransactionManager<TypeORMTransaction> {
    constructor(
        protected readonly dataSource: DataSource) {
        super()
    }

    createTransaction(): TypeORMTransaction {
        return Objects.create(TypeORMTransaction, this.dataSource)
    }
}
