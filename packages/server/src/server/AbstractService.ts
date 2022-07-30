import { Application } from "./Application";
import { Context } from "./Context";

export class AbstractService<A extends Application = Application> {
    constructor(
        public readonly app: A,
        public readonly context: Context) { }
}