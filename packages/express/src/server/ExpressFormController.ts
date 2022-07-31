import { Request, Response } from "express"
import { HttpContext, FormProcessor } from "@adronix/server"
import { Validator } from "@adronix/base"

export class ExpressFormController {
    constructor(private formProcessorProvider: () => FormProcessor) {
    }

    protected getProcessor() {
        return this.formProcessorProvider()
    }

    submitCallback(contextCreator: (request: Request, response: Response) => Promise<HttpContext>) {
        return async (request: Request, response: Response) => {
            try {
                const errors = await this.getProcessor().submit(
                    request.body,
                    await contextCreator(request, response))

                if (typeof errors == "object") {
                    response
                        .status(400)
                        .json(Validator.normalize(errors))
                }
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