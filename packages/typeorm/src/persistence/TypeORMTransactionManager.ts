import { TypeORMTransaction } from "./TypeORMTransaction";
import { TransactionManager } from '@adronix/persistence'
import { DataSource } from "typeorm";
import { PersistenceContext } from "@adronix/persistence";

export class TypeORMTransactionManager extends TransactionManager {
    constructor(
        protected readonly context: PersistenceContext,
        protected readonly dataSource: DataSource) {
        super()
    }

    createTransaction(): TypeORMTransaction {
        return new TypeORMTransaction(this.context, this.dataSource)
    }
}
