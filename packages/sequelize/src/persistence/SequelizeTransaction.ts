import { Sequelize, Transaction as _SequelizeTransaction } from "sequelize"
import { Transaction } from '@adronix/persistence'


export class SequelizeTransaction extends Transaction {
    transaction: _SequelizeTransaction

    constructor(
        protected sequelize: Sequelize) {
        super()
    }

    async start() {
        super.start()
        this.transaction = await this.sequelize.transaction()
    }

    async commit() {
        super.commit()
        try {
            await this.transaction.commit()
        }
        catch (err) {
            console.log(err)
        }
    }

    async rollback() {
        super.rollback()
        try
        {
            await this.transaction.rollback()
        }
        catch (err) {
            console.log(err)
        }
    }

    getTransaction() {
        return this.transaction
    }
}