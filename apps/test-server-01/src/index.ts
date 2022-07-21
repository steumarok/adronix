import "reflect-metadata"
import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import { ExpressApplication } from "@adronix/express";
import { Objects } from "@adronix/base";
import { dataSource, sequelize } from "./persistence/connection";
import { ITypeORMAware, TypeORMTransactionManager } from "@adronix/typeorm";
import { Module2 } from "@adronix/test-module-02";
import { Module1 } from "@adronix/test-module-01";
import { ISequelizeAware, SequelizeTransactionManager } from '@adronix/sequelize'

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



class TestApp extends ExpressApplication implements ITypeORMAware, ISequelizeAware {
    transactionManager = new TypeORMTransactionManager(dataSource)
    sequelizeTransactionManager = new SequelizeTransactionManager(sequelize)

    constructor() {
        super(app);
        this.setDefaultNotificationChannel('/sse');
        this.addModule(Module1);
        this.addModule(Module2);
    }

    getDataSource() {
        return dataSource
    }

    getSequelize() {
        return sequelize
    }

    getTypeORMTransactionManager() {
        return this.transactionManager
    }

    getSequelizeTransactionManager() {
        return this.sequelizeTransactionManager
    }
}

async function main() {
    await dataSource.initialize()
    const port = 3001

    await sequelize.sync({ force: true });

    const application = new TestApp()

    app.listen(port, () => {
        console.log("init")
    })
}

main()