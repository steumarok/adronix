import { AbstractService } from "./AbstractService"
import { Application } from "./Application"
import { Context } from "./Context"

export class NotificationService extends AbstractService {

    constructor(app: Application, context: Context) {
        super(app, context)
    }

    broadcast(category: string, event: string, data: any) {

    }
}