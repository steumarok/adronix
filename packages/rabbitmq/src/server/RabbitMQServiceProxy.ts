import { AbstractService, Application, IServiceProxy, ServiceContext } from "@adronix/server";
import { Channel, connect, Connection } from "amqplib";
import EventEmitter from "events";
import { v4 as uuidv4 } from "uuid"

const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

export class RabbitMQServiceProxy implements IServiceProxy {
    static connectionMap: Map<string, {
        connection: Connection;
        channel: Channel,
        responseEmitter: EventEmitter
    }> = new Map()

    constructor(
        protected readonly url: string,
        protected readonly queue: string) {

        this.checkConnection(url)
    }

    async checkConnection(url: string) {
        if (!RabbitMQServiceProxy.connectionMap.has(url)) {
            const connection = await connect(url)
            const channel = await connection.createChannel()
            const responseEmitter = new EventEmitter()
            responseEmitter.setMaxListeners(0)
            channel.consume(
                REPLY_QUEUE,
                msg => {
                    responseEmitter.emit(
                        msg.properties.correlationId,
                        JSON.parse(msg.content.toString('utf8')))
                },
                {
                    noAck: true
                }
            )

            RabbitMQServiceProxy.connectionMap.set(url, { connection, channel, responseEmitter })
        }
    }

    wrap<S extends AbstractService<Application>>(service: S): S {
        const self = this;
        return new Proxy(service, {
            get(target, prop) {
                if (typeof target[prop] === 'function') {
                    return new Proxy(target[prop], {
                        apply: (target, thisArg, argumentsList) => {

                            return self.sendMessage(
                                thisArg.context,
                                service.constructor.name,
                                prop as string,
                                argumentsList)


                            //console.log(argumentsList)
                            //return Reflect.apply(target, thisArg, argumentsList);
                        }
                    });
                } else {
                    return Reflect.get(target, prop);
                }
            }
        })
    }

    sendMessage(context: ServiceContext, service: string, method: string, args: any[]): Promise<any> {
        return new Promise(resolve => {
            const { channel, responseEmitter } = RabbitMQServiceProxy.connectionMap.get(this.url)
            const correlationId = uuidv4()
            responseEmitter.once(correlationId, resolve)
            channel.sendToQueue(
                this.queue,
                Buffer.from(JSON.stringify({ service, method, args })),
                { correlationId, replyTo: REPLY_QUEUE })
        })
    }
}