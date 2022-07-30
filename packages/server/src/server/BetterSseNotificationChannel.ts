import { BetterSseNotificationSession } from "./BetterSseNotificationSession";
import { NotificationChannel } from "./NotificationChannel";
import { NotificationSession } from "./NotificationSession";
import { createChannel } from 'better-sse'

export class BetterSseNotificationChannel implements NotificationChannel {

    channel = createChannel()

    register(session: NotificationSession): void {
        if (session instanceof BetterSseNotificationSession) {
            this.channel.register(session.session)
        }
    }

    broadcast(data: any, event: string): void {
        this.channel.broadcast(data, event)
    }
}