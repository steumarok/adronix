import { DataSet } from "./DataSet"
import { IQuery } from "./IQuery"
import { Item } from "./Item"
import { ItemFilter, ItemId, QuerySortFn } from "./types"

export class Query implements IQuery {
    sortFn?: QuerySortFn

    constructor(private dataSet: DataSet, private type: string, private expr: ItemId | ItemFilter) {}

    list(): Item[] {
      const results = this.dataSet.filterItems(this.type,
        typeof this.expr == "string" || typeof this.expr == "number"
          ? (item) => item.id == this.expr
          : this.expr)
      if (this.sortFn) {
        results.sort(this.sortFn)
      }
      return results
    }

    single(): Item | null {
      const results = this.list()
      return results.length > 0 ? results[0] : null
    }

    sort(fn: QuerySortFn): IQuery {
      this.sortFn = fn
      return this
    }
}