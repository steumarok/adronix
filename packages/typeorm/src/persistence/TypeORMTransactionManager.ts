import { TypeORMTransaction } from "./TypeORMTransaction";
import { TransactionManager } from '@adronix/persistence'
import { DataSource } from "typeorm";
import { Context } from "@adronix/server";

export class TypeORMTransactionManager extends TransactionManager {
    constructor(
        protected readonly context: Context,
        protected readonly dataSource: DataSource) {
        super()
    }

    createTransaction(): TypeORMTransaction {
        return new TypeORMTransaction(this.context, this.dataSource)
    }
}
