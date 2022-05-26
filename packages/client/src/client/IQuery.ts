import { Item } from "./Item";
import { QuerySortFn } from "./types";

export interface IQuery {
    list(): Item[];
    single(): Item | null;
    sort(fn: QuerySortFn): IQuery
}