import "reflect-metadata"

export const InjectService = (target: any, memberName: string) => {
    const type = Reflect.getMetadata("design:type", target, memberName);
    Object.defineProperty(target, memberName, {
        get: function () {
            return this.app.service(type, this.context);
        }
    });
};
