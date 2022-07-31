import { IncomingMessage, ServerResponse } from "http";
import { AbstractService } from "./AbstractService";
import { Application, WebApplication } from "./Application";

export interface Context {
    tenantId: string;
    application: Application;
    service<S extends AbstractService>(S: new (app: Application, context: Context) => S): S;
}

export type ExtendedServerResponse = ServerResponse & {
    status(code: number): ExtendedServerResponse
    json(data: any): ExtendedServerResponse
}

export class HttpContext implements Context {
    constructor (
        public readonly application: WebApplication,
        public readonly request: IncomingMessage,
        public readonly response: ExtendedServerResponse,
        public readonly tenantId: string) { }

    service<S extends AbstractService>(cls: new (app: Application, context: Context) => S): S {
        return this.application.service(cls, this)
    }
}
