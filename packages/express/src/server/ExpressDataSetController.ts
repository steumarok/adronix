import { Request, Response } from "express"
import { DataSetProcessor } from 'adronix-server'

export class ExpressDataSetController {
    constructor(private processorCtor: new () => DataSetProcessor) {
    }

    protected getProcessor() {
        return new this.processorCtor()
    }

    fetchCallback() {
        return async (request: Request, response: Response) => {
            const paramMap = new Map()
            for (let paramName in request.params) {
                paramMap.set(paramName, request.params[paramName])
            }

            response.status(200)
            response.json(await this.getProcessor().fetch(paramMap))
        }
    }

    syncCallback() {
        return async (request: Request, response: Response) => {
            response.status(200)
            response.json(await this.getProcessor().sync(request.body))
        }
    }
}