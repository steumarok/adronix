import "reflect-metadata"
import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import { ExpressApplication, ExpressDataSetController } from "@adronix/express";
import { BaseDataSetProcessor, Module1, TcmProductOption } from "@adronix/test-module-01";
import { Objects } from "@adronix/base";
import { EntityClass, Transaction, TransactionManager } from "@adronix/persistence";
import { DataSetProcessor, EntityDataSetProcessor, ItemCollector } from "@adronix/server";
import { DataSource } from "typeorm";
import { TypeORMTransaction, TypeORMTransactionManager } from "@adronix/typeorm";
import { dataSource, transactionManager } from "./persistence/connection";

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

class TestApp extends ExpressApplication {
    constructor() {
        super(app)
        this.addModule(Objects.create(Module1, this))
    }

    getDataSource() {
        return dataSource
    }

    getTransactionManager() {
        return transactionManager
    }

}

async function main() {
    await dataSource.initialize()
    const port = 3001

    const application = new TestApp()


/*
    const processorProvider = () => Objects.create(
        EditProductOptionProcessor, transactionManager, dataSource)

    const listProcessorProvider = () => Objects.create(
            ListProductOptionProcessor, transactionManager, dataSource)



    const dataProvider: DataProvider = async ({ page, limit }) => {

        const [ pos, count ] = await dataSource.getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .skip((parseInt(page)-1) * parseInt(limit))
            .take(parseInt(limit))
            .getManyAndCount()


        return [PaginatedList(TcmProductOption, pos, count)]
    }

    app.get("/listProductOption", createDataSetController(dataProvider).fetchCallback())

//    app.get("/listProductOption1",
 //       new ExpressDataSetController(listProcessorProvider).fetchCallback())

    app.get("/editProductOption/:id",
        new ExpressDataSetController(processorProvider).fetchCallback())
    app.post("/editProductOption/:id",
        new ExpressDataSetController(processorProvider).syncCallback())
    //app.get("/editProductOption/:id/sse",
    //    new ExpressDataSetController(processorProvider).sseCallback())
*/
    app.listen(port, () => {
        console.log("init")
    })
}

main()