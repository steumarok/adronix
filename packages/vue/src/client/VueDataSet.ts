import { DataSet, ItemProps, ReactiveValue, Item, QuerySortFn, ItemFilter, ItemId, IReactiveQuery, IQuery } from "@adronix/client";
import { watch, reactive } from 'vue';
import diff from 'object-diff'

export class VueDataSet extends DataSet {

    reactiveValues: ReactiveValue[] = [];
    stopHandlerMap = new Map<string, () => void>()
    valueMap = new Map<string, ItemProps>()

    protected getKey(item: Item) {
      return `${item.id}@${item.type}`
    }

    insert(type: string, properties: Omit<ItemProps, "id">) {
      super.insert(type, properties)
      this.refreshValues(type)
    }

    update(item: Item, properties: Omit<ItemProps, "id">) {
      const value = this.valueMap.get(this.getKey(item))
      if (value) {
        for (let propName in properties) {
          value[propName] = properties[propName]
        }
      }
      super.update(item, properties)
      this.refreshValues(item.type)
    }

    updateInternal(item: Item, properties: Omit<ItemProps, "id">) {
      super.update(item, properties)
      this.refreshValues(item.type)
    }

    reactiveList(results: Item[]) {
      const reactiveItems = reactive(results)

      reactiveItems.forEach(item => this.watchItem(item))

      return reactiveItems
    }

    watchItem(item: Item) {
      var stopHandler = this.stopHandlerMap.get(this.getKey(item))
      if (stopHandler) {
        stopHandler()
      }

      stopHandler = watch(() => ({...item}), (curr, prev) => this.updateInternal(item, diff(prev, curr)))
      this.stopHandlerMap.set(this.getKey(item), stopHandler)
      this.valueMap.set(this.getKey(item), item)
    }

    query(type: string, expr: ItemId | ItemFilter = () => true): IReactiveQuery {
      var query = super.query(type, expr)
      const _this = this
      return new class implements IQuery, IReactiveQuery {
        isReactive = false
        list(): Item[] {
          const items = query.list()

          if (this.isReactive) {
            const reactiveItems = _this.reactiveList(items)
            const rv = new ReactiveValue(type, query, reactiveItems)
            _this.reactiveValues.push(rv)

            return reactiveItems
          }
          else {
            return items
          }
        }

        single() {
          const item = query.single()
          if (item && this.isReactive) {
            const reactiveItem = reactive(item)

            _this.watchItem(reactiveItem)

            return reactiveItem
          }
          else {
            return item
          }
        }

        sort(fn: QuerySortFn): IQuery & IReactiveQuery {
          query = query.sort(fn)
          return this
        }

        reactive(): IReactiveQuery {
          this.isReactive = true
          return this
        }
      }
    }

    refreshValues(type: string) {
      this.reactiveValues
        .filter(rv => rv.type == type)
        .forEach(rv => {
          if (Array.isArray(rv.value)) {
            const newValue = this.reactiveList(rv.query.list())
            Array.prototype.splice.apply(rv.value, [0, rv.value.length, ...newValue])
          }
        })
    }

    protected updateRefs() {
      super.updateRefs()
      this.getItems()
        .map(i => i.type)
        .filter((v, i, a) => a.indexOf(v) === i)
        .forEach(type => this.refreshValues(type))
    }

  }