import { EntityClass } from "@adronix/persistence/src"
import { ItemCollector } from "./ItemCollector"
import { ReturnType } from "./types"

export function PaginatedList<T>(
    entityClass: EntityClass<T>,
    items: T[],
    totalCount: number): ReturnType {
    return collector => {
        const { idGetter } = collector.descriptors.get(entityClass)
        return collector
            .metadata(`${entityClass.name}.totalCount`, totalCount.toString())
            .metadata(`${entityClass.name}.ids`, items.map(pov => idGetter(pov)))
            .addList(items)
    }
}

