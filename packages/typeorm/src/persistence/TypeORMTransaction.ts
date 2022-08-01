import { DataSource, QueryRunner } from "typeorm"
import { Transaction } from '@adronix/persistence'
import { Context } from "@adronix/server"


export class TypeORMTransaction extends Transaction {
    queryRunner: QueryRunner

    constructor(
        context: Context,
        protected dataSource: DataSource) {
        super(context)
    }

    async start() {
        await super.start()
        this.queryRunner = this.dataSource.createQueryRunner()
        await this.queryRunner.connect()
        await this.queryRunner.startTransaction()
    }

    async commit() {
        await super.commit()
        try {
            await this.queryRunner.commitTransaction()
        }
        catch (err) {
            console.log(err)
        }
        finally {
            await this.queryRunner.release()
        }
    }

    async rollback() {
        await super.rollback()
        try
        {
            await this.queryRunner.rollbackTransaction()
        }
        catch (err) {
            console.log(err)
        }
        finally {
            await this.queryRunner.release()
        }
    }

    get entityManager() {
        return this.queryRunner.manager
    }
}