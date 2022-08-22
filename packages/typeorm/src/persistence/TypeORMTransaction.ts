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

    async saga(gen: Generator<(t: Transaction) => Promise<unknown>>) {
        var prev = null
        while (true) {
            const n = gen.next(prev)
            console.log(n)
            if (n.done) {
                break;
            }
            prev = await n.value(this)
            console.log(prev)

        }
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