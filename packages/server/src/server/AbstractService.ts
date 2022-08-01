import { Application } from "./Application";
import { Context } from "./Context";
import { Module } from "./Module";

export class AbstractService<A extends Application = Application> {
    constructor(
        public readonly app: A,
        public readonly module: Module<A>,
        public readonly context: Context) { }
}