import express from "express";
import { DataSource } from "typeorm";
import { ServerApp } from "./ServerApp";
import { MmsEntities } from '@adronix/mms'
import { CmnEntities } from "@adronix/cmn";

const e = express()


const dataSource = new DataSource({
    "type": "sqlite",
    "database": "/tmp/mms.db",
    "synchronize": true,
    logging: true,
    entities: [
        ...MmsEntities,
        ...CmnEntities
    ]
})

async function main() {

    await dataSource.initialize()

    new ServerApp(e, dataSource)

    e.listen(9000)
}


main()