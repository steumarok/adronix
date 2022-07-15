import { IGroup } from './IGroup'

export interface IUser {
    getId(): number

    getName(): string

    getGroups(): IGroup[]
}