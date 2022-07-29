import "reflect-metadata"
import { connect, Connection } from "amqplib"
import { dataSources } from "./persistence/connection";
import { ITypeORMAware } from "@adronix/typeorm";
import { Module2 } from "@adronix/test-module-02";
import { Module1 } from "@adronix/test-module-01";
import { ISequelizeAware } from '@adronix/sequelize'
import { expressjwt, Request as JWTRequest } from "express-jwt";
import { PersistenceContext } from "@adronix/persistence";
import { AbstractService, Application, ServiceContext } from "@adronix/server";
import { RabbitMQApplication } from "@adronix/rabbitmq";



class MQApp extends RabbitMQApplication implements ITypeORMAware {
    constructor(connection: Connection, queue: string) {
        super(connection, queue);
        this.addModule(Module1);
        this.addModule(Module2);
    }

    getTenantId(request: JWTRequest): string {
        console.log(request.auth)
        return 't1'
    }

    getDataSource(context: PersistenceContext) {
        return dataSources[context.tenantId]
    }

}

async function main() {

    await dataSources.t1.initialize()
    await dataSources.t2.initialize()

    const connection = await connect("amqp://guest:guest@localhost:5672")

    const application = new MQApp(connection, "queue")

}

main()