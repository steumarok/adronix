import { IQuery } from "./IQuery";

export interface IReactiveQuery extends IQuery {
    reactive(): IReactiveQuery;
}
