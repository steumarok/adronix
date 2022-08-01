import e, { Request, Response } from "express"
import { BetterSseNotificationSession, HttpContext, NotificationChannel } from '@adronix/server'

export class ExpressNotificationController {
    constructor(private channel: NotificationChannel) {
    }

    protected createSession() {
        return new BetterSseNotificationSession()
    }

    sseCallback(contextCreator: (request: Request, response: Response) => Promise<HttpContext>) {
        return async (request: Request, response: Response) => {

            const context = await contextCreator(request, response)

            const session = this.createSession()
            await session.init(request, response)

            this.channel.register(session)
        }
    }

}