import { AbstractService } from "./AbstractService";
import { Application } from "./Application";

export interface IServiceProxy {
    wrap<S extends AbstractService<Application>>(service: S): S
}