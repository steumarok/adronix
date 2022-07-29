import { Application, DataSetProcessor, FormProcessor } from "@adronix/server"
import { NotificationChannel } from "@adronix/server"
import { Connection } from "amqplib";
import e, { NextFunction, Request, Response } from "express";


export class RabbitMQApplication extends Application {
    constructor(
        protected readonly connection: Connection,
        protected readonly queue: string) {
        super()

        this.initialize()
    }

    async initialize() {
        const channel = await this.connection.createChannel()
        const assertion = channel.assertQueue(this.queue)
        await channel.consume(this.queue, async msg => {
            const payload = JSON.parse(msg.content.toString('utf8'))

            const service = this.services(payload.service, { tenantId: 't1'})
            const result = await service[payload.method].apply(service, payload.args)

            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(result)),
                { correlationId: msg.properties.correlationId }
            )

            channel.ack(msg)
        })


    }
}