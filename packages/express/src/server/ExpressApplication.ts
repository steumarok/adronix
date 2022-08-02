import { WebApplication, DataSetProcessor, FormProcessor, Application, Module } from "@adronix/server"
import { NotificationChannel } from "@adronix/server"
import { ExpressDataSetController } from "./ExpressDataSetController"
import { ExpressFormController } from "./ExpressFormController"
import { ExpressNotificationController } from "./ExpressNotificationController"
import e, { NextFunction, Request, Response } from "express";
import { ExtendedServerResponse } from "@adronix/server/src/server/Context"
import { ServerResponse } from "http"
import bodyParser from "body-parser";
import multer from 'multer';

const upload = multer()

export class ExpressApplication extends WebApplication {
    voidHandler: (req: Request, res: Response, next: NextFunction) => void = (_req, _resp, next) => { next() }
    securityHandler: (req: Request, res: Response, next: NextFunction) => void = this.voidHandler

    constructor(protected express: e.Application) {
        super()
    }

    protected extendResponse(response: ServerResponse) {
        return response as Response as ServerResponse & ExtendedServerResponse
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
        module: Module,
        path: string,
        dataSetProcessor: () => DataSetProcessor,
        secured: boolean) {
        this.express.get(
            path,
            secured ? this.securityHandler : this.voidHandler,
            this.createDataSetController(dataSetProcessor).fetchCallback(this.getHttpContextCreator(module)))
        this.express.post(
            path,
            secured ? this.securityHandler : this.voidHandler,
            bodyParser.json(),
            bodyParser.urlencoded({ extended: true }),
            upload.any(),
            this.createDataSetController(dataSetProcessor).syncCallback(this.getHttpContextCreator(module)))
    }

    registerFormProcessor(
        module: Module,
        path: string,
        formProcessor: () => FormProcessor,
        secured: boolean) {
        this.express.post(
            path,
            secured ? this.securityHandler : this.voidHandler,
            bodyParser.json(),
            bodyParser.urlencoded({ extended: true }),
            this.createFormController(formProcessor).submitCallback(this.getHttpContextCreator(module)))
    }

    registerNotificationChannel(
        module: Module,
        path: string,
        channel: NotificationChannel,
        secured: boolean): void {
        this.express.get(
            path,
            secured ? this.securityHandler : this.voidHandler,
            this.createNotificationController(channel).sseCallback(this.getHttpContextCreator(module)))
    }

    setSecurityHandler(handler: (req: Request, res: Response, next: NextFunction) => void) {
        this.securityHandler = handler
    }
}