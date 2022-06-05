import { IQuery } from "./IQuery";
import { Item } from "./Item";
import { Query } from "./Query";
import { ItemData, ItemFilter, ItemId, ItemProp, ItemProps, ItemRef } from "./types";

export class DataSet {
    private items: Item[] = [];

    protected getItems() {
      return this.items
    }

    getDelta() {
      const delta = new Array<ItemData>()
      this.items.filter(item => item.inserted).forEach(item => {
        const itemData: ItemData = { $id: item.id, $type: item.type, $inserted: true }
        for (let propName in item) {
          if (['id', 'type', 'changes', 'inserted', 'deleted'].indexOf(propName) == -1) {
            itemData[propName] = this.convertPropForDelta(item[propName])
          }
        }
        delta.push(itemData)
      })
      this.items.filter(item => item.changes.size > 0).forEach(item => {
        const itemData: ItemData = { $id: item.id, $type: item.type }
        item.changes.forEach(propName => {
            itemData[propName] = this.convertPropForDelta(item[propName])
        })
        delta.push(itemData)
      })
      return delta
    }

    protected convertPropForDelta(prop: ItemProp) {
      if (prop instanceof Item) {
        return {
          $idRef: prop.id,
          $type: prop.type
        } as ItemRef
      }
      else if (Array.isArray(prop)) {
        return (prop as Item[]).map(item => ({
          $idRef: item.id,
          $type: item.type
        } as ItemRef))
      }
      else {
        return prop
      }
    }

    async sync(cb: (delta: ItemData[]) => Promise<ItemData[]>) {
      const data = await cb(this.getDelta())

      data.forEach((itemData) => {

        if (itemData.$mappedId) {
          const item = this.items.find(item => item.id == itemData.$mappedId)

          if (item) {
            this.syncInserted(item, itemData.$id)
          }
        }
        else {
          const item = this.findItem(itemData.$type, item => item.id == itemData.$id)
          if (item) {
            if (item.deleted) {
              this.syncDeleted(item)
            }
            else {
              this.syncModified(item)
            }
          }
        }
      })
    }

    protected syncInserted(item: Item, id: ItemId) {
      item.id = id as string
      item.inserted = false
    }

    protected syncDeleted(item: Item) {
      const index = this.items.indexOf(item)
      this.items.splice(index, 1)
    }

    protected syncModified(item: Item) {
      item.changes.clear()
    }

    merge(data: ItemData[]) {
      const inserted = this.items.filter(item => item.inserted)

      data = data.filter(itemData => !itemData.$inserted || inserted.findIndex(item => item.id == itemData.$id) == -1)

      const modified = this.items.filter(item => item.deleted || item.changes.size > 0)
      const items = data.map(element => this.createItem(element))
      this.items = this.mergeModifiedItems(items, modified)
        .concat(inserted)

      this.updateRefs()
    }

    protected updateRefs() {
      for (let item of this.items) {
        for (let propName in item) {
          let propValue = item[propName]
          if (propValue && typeof propValue == "object") {
            const itemRef = (propValue as ItemRef)
            if (itemRef.$idRef) {
              const other = this.items.find(item => item.id === itemRef.$idRef && item.type === itemRef.$type)
              item[propName] = other
            }
            else if (Array.isArray(propValue)) {
              item[propName] =
                propValue.map(val => {
                  if (typeof propValue == "object") {
                    const itemRef = (val as ItemRef)
                    if (itemRef.$idRef) {
                      let other = this.items.find(item => item.id === itemRef.$idRef && item.type === itemRef.$type)
                      return other
                    } else {
                      return val
                    }
                  }
                })
            }
          }
        }
      }
    }

    query(type: string, expr: ItemId | ItemFilter = () => true): IQuery {
      return new Query(this, type, expr)
    }

    protected findItem(type: string, expr: ItemFilter): Item | null {
      return this.items.filter(item => item.type == type).find(expr) ?? null
    }

    /*
    findById(typeName: string, id: ItemId): ItemProps | null {
      const item = this.items.find(item => item.type == typeName && item.id == id)
      return item ? this.propertyMapper(item) : null
    }*/

    filterItems(typeName: string, expr: ItemFilter): Item[] {
      return this.items
        .filter(item => item.type === typeName)
        .filter(expr)
    }

    insert(typeName: string, properties: Omit<ItemProps, "id">) {
      const randomId = this.generateRandomId()
      const item = new Item(typeName, randomId)
      for (let propName in properties) {
        item[propName] = properties[propName]
      }
      item.inserted = true
      this.items.push(item)
    }

    protected generateRandomId() {
      return Math.random().toString(36).substring(2)
    }

    update(item: Item, properties: Omit<ItemProps, "id">) {
      for (let propName in properties) {
        item[propName] = properties[propName]
        if (!item.inserted) {
          item.changes.add(propName)
        }
      }
    }

    protected mergeModifiedItems(items: Item[], modified: Item[]): Item[] {
      for (let item of items) {
        const modItem = modified.find(i => i.type === item.type && i.id === item.id)
        if (modItem) {
          this.mergeModified(item, modItem)
        }
      }
      return items
    }

    protected mergeModified(item: Item, modItem: Item) {
      item.deleted = modItem.deleted
      item.changes = modItem.changes
      for (let propName of Array.from(modItem.changes)) {
        item[propName] = modItem[propName]
      }
    }

    protected createItem(element: any): Item {
      const item = new Item(element.$type, element.$id)
      for (const key in element) {
        if (!key.startsWith("$")) {
          item[key] = element[key]
        }
      }
      if (element.$inserted) {
        item.inserted = true
      }
      return item
    }

    protected readProperties(element: ItemData): ItemProps {
      let properties: ItemProps = {
        id: element.$id
      }
      for (const key in element) {
        if (!key.startsWith("$")) {
          properties[key] = element[key]
        }
      }
      return properties
    }
  }