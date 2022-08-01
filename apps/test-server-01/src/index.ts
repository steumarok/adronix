import "reflect-metadata"
import express, { Request } from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import multer from 'multer';
import { ExpressApplication } from "@adronix/express";
import { dataSources, sequelize } from "./persistence/connection";
import { extendTypeORMContext, TypeORMContext } from "@adronix/typeorm";
import { Module2 } from "@adronix/test-module-02";
import { Module1, Service1 } from "@adronix/test-module-01";
import { ISequelizeAware } from '@adronix/sequelize'
import { expressjwt, Request as JWTRequest } from "express-jwt";
import { RabbitMQServiceProxy } from "@adronix/rabbitmq";
import { DataSource } from "typeorm";
import { IamAuthModule } from '@adronix/iam'
import { IncomingMessage } from "http";

const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const upload = multer()
app.use(upload.any())


class TestApp extends ExpressApplication {
    constructor() {
        super(app);
        this.setSecurityHandler(expressjwt({
            secret: "test",
            algorithms: ["HS256"],
            getToken: function (req: Request): string {
                if (
                  req.headers.authorization &&
                  req.headers.authorization.split(" ")[0] === "Bearer"
                ) {
                  return req.headers.authorization.split(" ")[1];
                } else if (req.query && req.query.token) {
                  return req.query.token as string
                }
                return null;
              }
        }))
    }

    protected initialize() {
        super.initialize()
        this.addModule(IamAuthModule);

        this.addModule(Module1, {
            secured: true,
            http: {
                urlContext: '/module1',
            }/*,
            services: [
                [ Service1, { proxy: new RabbitMQServiceProxy("amqp://guest:guest@localhost:5672", "queue") } ]
            ]*/
        });
        this.addModule(Module2, { http: { urlContext: '/module2' }, secured: true });

        this.extendContext(extendTypeORMContext(context => dataSources[context.tenantId]))
    }

    getTenantId(request: JWTRequest): string {
        console.log(request.auth)
        return 't1'
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