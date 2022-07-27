import { Errors } from "@adronix/base"
import { Application, CallContext } from "./Application"
import { Module } from "./Module"

export abstract class FormProcessor {

    constructor(protected module: Module<Application>) {
    }

    abstract submit(
        context: CallContext,
        payload: any): Promise<{ errors?: Errors, status: number}>

}