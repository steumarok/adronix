import { getConnection, QueryRunner } from "typeorm"
import { Transaction } from '@adronix/persistence'


export class TypeORMTransaction extends Transaction {
    queryRunner: QueryRunner

    async start() {
        super.start()
        this.queryRunner = getConnection().createQueryRunner()
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