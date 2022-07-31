import { Errors } from "@adronix/base"
import { Application } from "./Application"
import { HttpContext } from "./Context"
import { Module } from "./Module"

export abstract class FormProcessor {

    constructor(protected module: Module<Application>) {
    }

    abstract submit(
        context: HttpContext,
        payload: any): Promise<Errors | void>

}