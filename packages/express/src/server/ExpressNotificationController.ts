import { Request, Response } from "express"
import { BetterSseNotificationSession, NotificationChannel } from '@adronix/server'

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