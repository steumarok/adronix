import "reflect-metadata"
import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import multer from 'multer';
import { ExpressApplication } from "@adronix/express";
import { dataSources, sequelize } from "./persistence/connection";
import { ITypeORMAware } from "@adronix/typeorm";
import { Module2 } from "@adronix/test-module-02";
import { Module1 } from "@adronix/test-module-01";
import { ISequelizeAware } from '@adronix/sequelize'
import { expressjwt, Request as JWTRequest } from "express-jwt";
import { IncomingMessage } from "http";
import { PersistenceContext } from "@adronix/persistence/src";

const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const upload = multer()
app.use(upload.any())


class TestApp extends ExpressApplication implements ITypeORMAware, ISequelizeAware {
    constructor() {
        super(app);
        this.setDefaultNotificationChannel('/sse');
        this.setSecurityHandler(expressjwt({ secret: "shhhhhhared-secret", algorithms: ["HS256"] }))
        this.addModule(Module1, { urlContext: '/module1', secured: true });
        this.addModule(Module2, { urlContext: '/module2', secured: true });
    }

    getTenantId(request: JWTRequest): string {
        console.log(request.auth)
        return 't1'
    }

    getDataSource(context: PersistenceContext) {
        return dataSources[context.tenantId]
    }

    getSequelize() {
        return sequelize
    }
}

async function main() {

    await dataSources.t1.initialize()
    await dataSources.t2.initialize()

    const port = 3001

    await sequelize.sync({ force: true });

    const application = new TestApp()

    app.listen(port, () => {
        console.log("init")
    })
}

main()