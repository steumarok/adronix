import { DataSet, ItemProps, ReactiveValue, Item, QuerySortFn, ItemFilter, ItemId, IReactiveQuery, IQuery, ItemData, useEventSource, NotificationListener, useFetch, IDataBroker, ServerErrors } from "@adronix/client";
import { watch, reactive, ref, unref, Ref, isRef, watchEffect, onUnmounted, ComputedRef } from 'vue';
import diff from 'object-diff'

interface ExtendedVueDataSet {
  commit(): Promise<boolean>
  refresh(): Promise<void>
}

//const reg = new FinalizationRegistry((value: string) => console.log(value))


export function dataSet(
  url: string | Ref<string | null>,
  dataBroker: IDataBroker = useFetch(),
  notificationBroker = useEventSource('/api/io/sse/data')): VueDataSet & ExtendedVueDataSet {

  const dataSet = new class extends VueDataSet implements ExtendedVueDataSet {
    constructor() {
      super()
      //reg.register(this, "test")
    }

    async commit() {
      return await this.sync(async (delta) => {
        const url_ = isRef(url) ? unref(url) : url

        if (!url_) {
          throw new Error("Url is undefined")
        }

        let resp = await dataBroker.post(url_, delta)
        if (resp.status == 200 || resp.status == 400) {
          return await resp.json() as ItemData[]
        }
        else {
          throw await resp.text()
        }
      })
    }

    async refresh() {
      await doFetch()
    }
  }

  const notificationManagers = new Map<string, NotificationListener>();
  const stopListeners = () => notificationManagers.forEach(m => m.stop())

  onUnmounted(() => {
    stopListeners()
  })

  function listenNotifications() {

    stopListeners()

    const metadata = dataSet.query('Metadata', (item) => item.id == '$types').single()

    if (metadata) {
      (metadata.value as string).split(',')
        .forEach(type => {
          const listener = notificationBroker.on(type, () => {
            doFetch()
          })
          notificationManagers.set(type, listener)
        })
    }
  }

  async function doFetch(): Promise<void> {
    const url_ = isRef(url) ? unref(url) : url

    if (!url_) {
      return
    }

    const resp = await dataBroker.get(url_)
    if (resp.status == 200) {
      const data = await resp.json()
      const items = data as ItemData[]
      dataSet.merge(items)
      listenNotifications()
    }
    else {
      throw await resp.text()
    }
  }

  if (isRef(url)) {
    // setup reactive re-fetch if input URL is a ref
    watchEffect(doFetch)
  } else {
    // otherwise, just fetch once
    // and avoid the overhead of a watcher
    void doFetch()
  }

  return dataSet
}

export class VueDataSet extends DataSet {

    reactiveValues: ReactiveValue[] = [];
    stopHandlerMap = new Map<string, () => void>()
    valueMap = new Map<string, ItemProps>()

    protected getKey(item: Item) {
      return `${item.id}@${item.type}`
    }

    protected syncErrors(item: Item, errors: ServerErrors) {
      super.syncErrors(item, errors)
      this.update(item, { errors })
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

    delete(item: Item) {
      super.delete(item)
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

    list(type: string, expr: ItemId | ItemFilter = () => true) {
      return this.query(type, expr).reactive().list()
    }

    ref(type: string, expr: ItemId | ItemFilter = () => true): Ref<Item> {
      const list = this.list(type, expr)
      const result = ref(list.length > 0 ? list[0] : null)
      watch(list, () => result.value = list.length > 0 ? list[0] : null)
      return result as Ref<Item>
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
      const itemTypes = this.findItem("Metadata", item => item.id == "$types")?.value;

      if (itemTypes) {
        (itemTypes as string).split(",").forEach(type => this.refreshValues(type))
      }
      this.refreshValues("Metadata")
    }

  }