import "reflect-metadata"
import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import multer from 'multer';
import { ExpressApplication } from "@adronix/express";
import { dataSources, sequelize } from "./persistence/connection";
import { ITypeORMAware } from "@adronix/typeorm";
import { Module2 } from "@adronix/test-module-02";
import { Module1, Service1 } from "@adronix/test-module-01";
import { ISequelizeAware } from '@adronix/sequelize'
import { expressjwt, Request as JWTRequest } from "express-jwt";
import { PersistenceContext } from "@adronix/persistence";
import { AbstractService, Application, ServiceContext } from "@adronix/server";
import { RabbitMQServiceProxy } from "@adronix/rabbitmq";

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
        this.addModule(Module1, {
            secured: true,
            web: {
                urlContext: '/module1',
            },
            services: [
                [ Service1, { proxy: new RabbitMQServiceProxy("amqp://guest:guest@localhost:5672", "queue") } ]
            ]
        });
        this.addModule(Module2, { web: { urlContext: '/module2' }, secured: true });
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