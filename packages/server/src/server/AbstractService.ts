import { PersistenceContext } from "@adronix/persistence/src";
import { Application } from "./Application";

export interface ServiceContext extends PersistenceContext {
}

export class AbstractService<A extends Application = Application> {
    constructor(
        public readonly app: A,
        public readonly context: ServiceContext) { }
}