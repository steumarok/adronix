import { Request, Response } from "express"
import { BetterSseNotificationSession, DataSetProcessor, NotificationChannel } from '@adronix/server'
import { Objects } from "@adronix/base"

export class ExpressNotificationController {
    constructor(private channel: NotificationChannel) {
    }

    protected createSession() {
        return new BetterSseNotificationSession()
    }

    sseCallback() {
        return async (request: Request, response: Response) => {
            const session = this.createSession()
            await session.init(request, response)

            this.channel.register(session)
        }
    }

}