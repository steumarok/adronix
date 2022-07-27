import { Request, Response } from "express"
import { DataSetProcessor } from '@adronix/server'
import { Objects } from "@adronix/base"
import { CallContext } from "@adronix/server/src/server/Application"

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

    fetchCallback(contextCreator: (request: Request, response: Response) => Promise<CallContext>) {
        return async (request: Request, response: Response) => {
            try {
                response.json(await this.getProcessor().fetch(
                    this.collectParams(request),
                    await contextCreator(request, response)))
                response.status(200)
            }
            catch (e) {
                console.log(e)

                response
                    .status(500)
                    .send("Internal server error")
            }
        }
    }

    syncCallback(contextCreator: (request: Request, response: Response) => Promise<CallContext>) {
        return async (request: Request, response: Response) => {
            try {
                const { data, status } = await this.getProcessor().sync(
                    request.body,
                    await contextCreator(request, response))
                response
                    .status(status)
                    .json(data)
            }
            catch (e) {
                console.log(e)

                response
                    .status(500)
                    .send("Internal server error")
            }
        }
    }
}