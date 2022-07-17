import { Application, DataSetProcessor } from "@adronix/server"
import { NotificationChannel } from "@adronix/server"
import { ExpressDataSetController } from "./ExpressDataSetController"
import { ExpressNotificationController } from "./ExpressNotificationController copy"


export class ExpressApplication extends Application {
    constructor(protected express) {
        super()
    }

    createDataSetController(dataSetProcessor: () => DataSetProcessor): ExpressDataSetController {
        return new ExpressDataSetController(dataSetProcessor)
    }

    createNotificationController(channel: NotificationChannel): ExpressNotificationController {
        return new ExpressNotificationController(channel)
    }

    registerProcessor(path: string, dataSetProcessor: () => DataSetProcessor) {
        this.express.get(
            path,
            this.createDataSetController(dataSetProcessor).fetchCallback())
        this.express.post(
            path,
            this.createDataSetController(dataSetProcessor).syncCallback())
    }

    registerNotificationChannel(path: string, channel: NotificationChannel): void {
        this.express.get(
            path,
            this.createNotificationController(channel).sseCallback())
    }
}