import { WebApplication, DataSetProcessor, FormProcessor } from "@adronix/server"
import { NotificationChannel } from "@adronix/server"
import { ExpressDataSetController } from "./ExpressDataSetController"
import { ExpressFormController } from "./ExpressFormController"
import { ExpressNotificationController } from "./ExpressNotificationController"
import e, { NextFunction, Request, Response } from "express";


export class ExpressApplication extends WebApplication {
    voidHandler: (req: Request, res: Response, next: NextFunction) => void = (_req, _resp, next) => { next() }
    securityHandler: (req: Request, res: Response, next: NextFunction) => void = this.voidHandler

    constructor(protected express: e.Application) {
        super()
    }

    createDataSetController(dataSetProcessor: () => DataSetProcessor): ExpressDataSetController {
        return new ExpressDataSetController(dataSetProcessor)
    }

    createFormController(formProcessor: () => FormProcessor): ExpressFormController {
        return new ExpressFormController(formProcessor)
    }

    createNotificationController(channel: NotificationChannel): ExpressNotificationController {
        return new ExpressNotificationController(channel)
    }

    registerProcessor(
        path: string,
        dataSetProcessor: () => DataSetProcessor,
        secured: boolean) {
        this.express.get(
            path,
            secured ? this.securityHandler : this.voidHandler,
            this.createDataSetController(dataSetProcessor).fetchCallback(this.createCallContext.bind(this)))
        this.express.post(
            path,
            this.createDataSetController(dataSetProcessor).syncCallback(this.createCallContext.bind(this)))
    }

    registerFormProcessor(
        path: string,
        formProcessor: () => FormProcessor,
        secured: boolean) {
        this.express.post(
            path,
            secured ? this.securityHandler : this.voidHandler,
            this.createFormController(formProcessor).submitCallback(this.createCallContext.bind(this)))
    }

    registerNotificationChannel(
        path: string,
        channel: NotificationChannel,
        secured: boolean): void {
        this.express.get(
            path,
            secured ? this.securityHandler : this.voidHandler,
            this.createNotificationController(channel).sseCallback())
    }

    setSecurityHandler(handler: (req: Request, res: Response, next: NextFunction) => void) {
        this.securityHandler = handler
    }
}