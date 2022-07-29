import { EntityClass, EntityEventKind, EntityId, EntityIO, EntityProps, PersistenceContext, TransactionEventKind } from "@adronix/persistence/src"
import { AbstractService, ServiceContext } from "./AbstractService"
import { Application } from "./Application"

export class NotificationService extends AbstractService {

    constructor(app: Application, context: ServiceContext) {
        super(app, context)
    }

    broadcast(category: string, event: string, data: any) {

    }
}