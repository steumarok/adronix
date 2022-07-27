import { PersistenceContext } from "@adronix/persistence/src";
import { AbstractService, Application } from "@adronix/server";
import { ITypeORMAware } from "../persistence/ITypeORMAware";

export const InjectDataSource = (target: any, memberName: string) => {
    Object.defineProperty(target, memberName, {
        get: function () {
            const service = this as AbstractService<Application>
            const app = service.app as any as ITypeORMAware
            const ctx = service.context as PersistenceContext
            return app.getDataSource(ctx)
        }
    });
};