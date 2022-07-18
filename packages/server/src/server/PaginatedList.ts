import { EntityClass } from "@adronix/persistence/src"
import { ItemCollector } from "./ItemCollector"

export function PaginatedList<T>(
    entityClass: EntityClass<T>,
    items: T[],
    totalCount: number): (collector: ItemCollector) => ItemCollector {
    return collector => {
        const { idGetter } = collector.descriptors.get(entityClass)
        return collector
            .metadata(`${entityClass.name}.totalCount`, totalCount)
            .metadata(`${entityClass.name}.ids`, items.map(pov => idGetter(pov)))
            .addList(items)
    }
}

