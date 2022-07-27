import "reflect-metadata"
import { AbstractService, ServiceContext } from "./AbstractService";
import { Application } from "./Application";

export const InjectService = (target: any, memberName: string) => {
    var type = Reflect.getMetadata("design:type", target, memberName);
    Object.defineProperty(target, memberName, {
        get: function () {
            const service = this as AbstractService<Application>
            const ctx = service.context as ServiceContext
            return service.app.services(type, ctx);
        }
    });
};
