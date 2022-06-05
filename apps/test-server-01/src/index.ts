import "reflect-metadata"
import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import { ExpressDataSetController } from "@adronix/express";
import { dataSource, transactionManager } from "./persistence/connection";
import { EditProductOptionProcessor } from "@adronix/test-module-01";
import { Objects } from "@adronix/base/src";
import { EntityClass } from "@adronix/persistence/src";
import { ItemCollector } from "@adronix/server";

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function PaginatedList<T>(
    entityClass: EntityClass<T>,
    items: T[],
    totalCount: number): (collector: ItemCollector) => ItemCollector {
    return collector => {
        const { idGetter } = collector.descriptors.get(entityClass)
        return collector
            .metadata(`${entityClass.name}.totalCount`, totalCount)
            .metadata(`${entityClass.name}.ids`, items.map(pov => idGetter(pov)))
            .addList(items)
    }
}

async function main() {
    await dataSource.initialize()
    const port = 3001

    const processorProvider = () => Objects.create(EditProductOptionProcessor, transactionManager, dataSource)

    app.get("/editProductOption/:id",
        new ExpressDataSetController(processorProvider).fetchCallback())
    app.post("/editProductOption/:id",
        new ExpressDataSetController(processorProvider).syncCallback())

    app.listen(port, () => {
        console.log("init")
    })
}

main()