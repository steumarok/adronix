import { Request, Response } from "express"
import { FormProcessor } from "@adronix/server"
import { CallContext } from "@adronix/server/src/server/Application"

export class ExpressFormController {
    constructor(private formProcessorProvider: () => FormProcessor) {
    }

    protected getProcessor() {
        return this.formProcessorProvider()
    }

    submitCallback(contextCreator: (request: Request, response: Response) => Promise<CallContext>) {
        return async (request: Request, response: Response) => {
            try {
                const { errors, status } = await this.getProcessor().submit(
                    await contextCreator(request, response),
                    request.body)
                response
                    .status(status)
                    .json(errors)
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