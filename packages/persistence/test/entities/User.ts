import { IGroup } from "./IGroup";
import { IUser } from "./IUser";

export class User implements IUser {
    constructor(
        private id: number,
        private name: string,
        private groups: IGroup[]) {
    }

    getId(): number {
        return this.id
    }

    getName(): string {
        return this.name
    }

    getGroups(): IGroup[] {
        return this.groups
    }
}