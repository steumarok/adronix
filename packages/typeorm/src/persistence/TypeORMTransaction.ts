import { DataSource, QueryRunner } from "typeorm"
import { Transaction } from '@adronix/persistence'
import { Context } from "@adronix/server"
import { Errors } from "@adronix/base/src"


export class TypeORMTransaction extends Transaction {
    queryRunner: QueryRunner

    constructor(
        context: Context,
        protected dataSource: DataSource) {
        super(context)
    }

    async saga<R>(gen: Generator<(t: Transaction) => Promise<unknown>>): Promise<R> {
        var prev = null
        var value = null
        while (true) {
            const n = gen.next(prev)
            value = n.value
            if (n.done) {
                break;
            }
            prev = await value(this)
        }
        return value
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