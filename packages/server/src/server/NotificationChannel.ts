import { NotificationSession } from "./NotificationSession";

export interface NotificationChannel {
    register(session: NotificationSession): void

    broadcast(data: any, event: string): void
}
