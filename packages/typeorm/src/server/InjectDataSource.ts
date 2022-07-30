import { TypeORMContext } from "../persistence/TypeORMContext";

export const InjectDataSource = (target: any, memberName: string) => {
    Object.defineProperty(target, memberName, {
        get: function () {
            const ctx = this.context as TypeORMContext
            return ctx.dataSources['default']
        }
    });
};