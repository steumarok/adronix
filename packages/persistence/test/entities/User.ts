import { IGroup } from "./IGroup";

export class User {
    constructor(
        readonly id: number = null,
        readonly name: string = null,
        readonly groups: IGroup[] = []) {
    }

    withId(id: number) {
        return new User(
            id,
            this.name,
            this.groups)
    }

    withName(name: string) {
        return new User(
            this.id,
            name,
            this.groups)
    }
}