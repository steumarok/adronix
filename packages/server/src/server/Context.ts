import { IncomingMessage, ServerResponse } from "http";
import { AbstractService } from "./AbstractService";
import { Application, WebApplication } from "./Application";
import { Module } from "./Module";

export interface Context {
    tenantId: string;
    application: Application;
    module: Module;
    service: <S extends AbstractService>(S: new (app: Application, module: Module, context: Context) => S) => S;
}

export type ExtendedServerResponse = ServerResponse & {
    status(code: number): ExtendedServerResponse
    json(data: any): ExtendedServerResponse
}

export class HttpContext implements Context {
    constructor (
        public readonly application: WebApplication,
        public readonly module: Module,
        public readonly request: IncomingMessage,
        public readonly response: ExtendedServerResponse,
        public readonly tenantId: string) { }

    service = function<S extends AbstractService>(cls: new (app: Application, module: Module, context: Context) => S): S {
        return this.application.service(cls, this)
    }
}


