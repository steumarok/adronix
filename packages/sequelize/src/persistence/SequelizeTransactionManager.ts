import { TransactionManager } from '@adronix/persistence'
import { Objects } from '@adronix/base'
import { Sequelize } from "sequelize";
import { SequelizeTransaction } from "./SequelizeTransaction"

export class SequelizeTransactionManager extends TransactionManager {
    constructor(
        protected readonly sequelize: Sequelize) {
        super()
    }

    createTransaction(): SequelizeTransaction {
        return Objects.create(SequelizeTransaction, this.sequelize)
    }
}
