import { Metadata } from "./Metadata"
import { DataMap, DescriptorMap, IdGetter, ItemData, ItemId, ItemRef } from "./types"

export class ItemCollector {
    public descriptors: DescriptorMap = new Map()
    protected items: any[] = new Array()
    private mappedIds: Map<ItemId, ItemId> = new Map()
    private idCounter = 0

    constructor() {
        this.describe(Metadata, ['value'])
    }

    describe(
        entityClass: any,
        propNames: string[] = [],
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

    addMappedId(id: ItemId, mappedId: ItemId) {
        this.mappedIds.set(id, mappedId)
    }

    protected generateNewId() {
        return --this.idCounter
    }

    protected isInsertion(item: any): boolean {
        const { idGetter } = this.descriptors.get(item.constructor)
        return !idGetter(item)
    }

    addItemData(item: any, dataMap: DataMap) {
        const { propNames, idGetter } = this.descriptors.get(item.constructor)

        const insertion = this.isInsertion(item)
        const id = insertion ? this.generateNewId() : idGetter(item)

        const key = `${id}@${item.constructor.name}`
        const itemData = dataMap.has(key)
            ? dataMap.get(key)
            : { $id: id, $type: item.constructor.name } as ItemData

        propNames.forEach(propName => {
            const value = this.readProperty(item, propName, dataMap)
            if (value) {
                itemData[propName] = value
            }
        })

        if (insertion) {
            itemData.$inserted = true
        }

        if (this.mappedIds.has(id)) {
            itemData.$mappedId = this.mappedIds.get(id)
        }

        dataMap.set(key, itemData)

        return itemData
    }

    readProperty(item: any, propName: string, dataMap: DataMap): any {
        const value = item[propName]
        if (Array.isArray(value)) {
            return value.map(v => this.readValue(v, dataMap))
        }
        else {
            return this.readValue(value, dataMap)
        }
    }

    readValue(value: any, dataMap: DataMap) {
        if (typeof value == "object" && this.descriptors.has(value.constructor)) {
            return this.getItemRef(value, dataMap)
        }
        else {
            return value
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