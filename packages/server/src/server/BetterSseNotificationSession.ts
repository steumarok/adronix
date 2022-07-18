import { NotificationSession } from "./NotificationSession";
import { createSession, Session } from "better-sse";
import { IncomingMessage, ServerResponse } from "http";

export class BetterSseNotificationSession implements NotificationSession {

    session: Session

    async init(req: IncomingMessage, resp: ServerResponse) {
        this.session = await createSession(req, resp)
    }
}