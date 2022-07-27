import { DataSource, QueryRunner } from "typeorm"
import { Transaction } from '@adronix/persistence'
import { PersistenceContext } from "@adronix/persistence"


export class TypeORMTransaction extends Transaction {
    queryRunner: QueryRunner

    constructor(
        context: PersistenceContext,
        protected dataSource: DataSource) {
        super(context)
    }

    async start() {
        super.start()
        this.queryRunner = this.dataSource.createQueryRunner()
        await this.queryRunner.connect()
        await this.queryRunner.startTransaction()
    }

    async commit() {
        super.commit()
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
        super.rollback()
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