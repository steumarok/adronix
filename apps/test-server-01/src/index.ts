import "reflect-metadata"
import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import { ExpressApplication } from "@adronix/express";
import { Objects } from "@adronix/base";
import { dataSource, sequelize, sequelizeTransactionManager, transactionManager } from "./persistence/connection";
import { ITypeORMManager } from "@adronix/typeorm";
import { Module2 } from "@adronix/test-module-02";
import { Module1 } from "@adronix/test-module-01";
import { ISequelizeManager } from '@adronix/sequelize'

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



class TestApp extends ExpressApplication implements ITypeORMManager, ISequelizeManager {
    constructor() {
        super(app);
        this.setDefaultNotificationChannel('/sse');
        this.addModule(Objects.create(Module1, this));
        this.addModule(Objects.create(Module2, this));

        (async () => {
            await sequelize.sync({ force: true });
            // Code here
        })();
    }

    getDataSource() {
        return dataSource
    }

    getSequelize() {
        return sequelize
    }

    getTypeORMTransactionManager() {
        return transactionManager
    }

    getSequelizeTransactionManager() {
        return sequelizeTransactionManager
    }
}

async function main() {
    await dataSource.initialize()
    const port = 3001

    const application = new TestApp()

    app.listen(port, () => {
        console.log("init")
    })
}

main()