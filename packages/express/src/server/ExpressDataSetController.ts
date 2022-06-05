import { Request, Response } from "express"
import { DataSetProcessor } from '@adronix/server'
import { Objects } from "@adronix/base"

export class ExpressDataSetController {
    constructor(private processorProvider: () => DataSetProcessor) {
    }

    protected getProcessor() {
        return this.processorProvider()
    }

    collectParams(request: Request): Map<string, string> {
        const paramMap = new Map()
        for (let paramName in request.params) {
            paramMap.set(paramName, request.params[paramName])
        }
        for (let paramName in request.query) {
            paramMap.set(paramName, request.query[paramName])
        }
        return paramMap
    }

    fetchCallback() {
        return async (request: Request, response: Response) => {
            response.json(await this.getProcessor().fetch(this.collectParams(request)))
            response.status(200)
        }
    }

    syncCallback() {
        return async (request: Request, response: Response) => {
            response.json(await this.getProcessor().sync(request.body))
            response.status(200)
        }
    }
}