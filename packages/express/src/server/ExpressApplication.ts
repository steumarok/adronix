import { Application, DataSetProcessor } from "@adronix/server"
import { ExpressDataSetController } from "./ExpressDataSetController"


export class ExpressApplication extends Application {
    constructor(protected express) {
        super()
    }

    createDataSetController(dataSetProcessor: () => DataSetProcessor): ExpressDataSetController {
        return new ExpressDataSetController(dataSetProcessor)
    }

    registerProcessor(path: string, dataSetProcessor: () => DataSetProcessor) {
        this.express.get(path, this.createDataSetController(dataSetProcessor).fetchCallback())
    }
}