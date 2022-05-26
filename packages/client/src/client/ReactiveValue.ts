import { IQuery } from "./IQuery"

export class ReactiveValue {
  constructor(
    public type: string,
    public query: IQuery,
    public value: any
  ) {}
}