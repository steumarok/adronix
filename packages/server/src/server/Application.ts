import { DataSetProcessor } from "./DataSetProcessor"
import { Module } from "./Module"
import { DataProvider } from "./types"

export abstract class Application {
    modules: Module<Application>[] = []

    addModule<A extends Application>(module: Module<A>) {
        this.modules.push(module)
    }

    abstract registerProcessor(
        path: string,
        dataSetProcessor: () => DataSetProcessor): void
}