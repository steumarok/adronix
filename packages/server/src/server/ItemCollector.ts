import { Metadata } from "./Metadata"
import { DataMap, DescriptorMap, IdGetter, ItemData, ItemRef } from "./types"

export class ItemCollector {
    public descriptors: DescriptorMap = new Map()
    protected items: any[] = new Array()

    constructor() {
        this.describe(Metadata, ['value'])
    }

    describe(
        entityClass: any,
        propNames: string[],
        idGetter: IdGetter = (item) => item.id) {
        this.descriptors.set(entityClass, { propNames, idGetter })
        return this
    }

    metadata(id: string, value: any) {
        this.items.push(new Metadata(id, value))
        return this
    }

    addOne<T>(item: T) {
        this.items.push(item)
        return this
    }

    addList<T>(items: T[]) {
        this.items = [...this.items, ...items]
        return this
    }

    add(c: (collector: ItemCollector) => ItemCollector) {
        return c(this)
    }

    addItemData(item: any, dataMap: DataMap) {
        console.log(item.constructor)
        const { propNames, idGetter } = this.descriptors.get(item.constructor)
        const key = `${idGetter(item)}@${item.constructor.name}`
        const itemData = dataMap.has(key)
            ? dataMap.get(key)
            : { $id: idGetter(item), $type: item.constructor.name } as ItemData
        propNames.forEach(propName => {
            const value = this.readProperty(item, propName, dataMap)
            if (value) {
                itemData[propName] = value
            }
        })
        dataMap.set(key, itemData)
        return itemData
    }

    readProperty(item: any, propName: string, dataMap: DataMap): any {
        const value = item[propName]
        if (Array.isArray(value)) {
            return value.map(v => {
                if (typeof v == "object" && this.descriptors.has(v.constructor)) {
                    return this.getItemRef(v, dataMap)
                 }
                 else {
                     return v
                 }
            })
        }
        else {
            if (typeof value == "object" && this.descriptors.has(value.constructor)) {
                return this.getItemRef(value, dataMap)
            }
            else {
                return value
            }
        }
    }

    getItemRef(item: object, dataMap: DataMap) {
        const refData = this.addItemData(item, dataMap)
        return {
            $idRef: refData.$id,
            $type: refData.$type,
        } as ItemRef
    }

    get(): ItemData[] {
        const dataMap: DataMap = new Map()
        this.items.forEach(item => this.addItemData(item, dataMap))
        return Array.from(dataMap.values())
    }


}