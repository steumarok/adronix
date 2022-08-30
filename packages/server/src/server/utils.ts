import { EntityClass } from "@adronix/persistence"
import { PaginatedList, ReturnType } from "@adronix/server"
import { Like, Repository } from "typeorm"
import { ItemData } from "./types"

type TableParams = {
    page: string,
    limit: string,
    sortBy: string,
    descending: string,
    filter: string
}

export class Utils {
    static toBool(str: string | boolean): boolean {
        return !!str && str.toString() == 'true'
    }

    static toInt(str: string): number {
        return Number.parseInt(str)
    }

    static distinct(elements: any[], idProp: string) {
        return elements.filter((v, i, a) => a.map(e => e[idProp]).indexOf(v[idProp]) === i)
    }

    static groupBy<K, V>(array: V[], grouper: (item: V) => K) {
        return array.reduce((store, item) => {
            var key = grouper(item)
            if (!store.has(key)) {
                store.set(key, [item])
            } else {
                store.get(key).push(item)
            }
            return store
        }, new Map<K, V[]>())
    }

    static transformMap<K, V, R>(
        source: Map<K, V>,
        transformer: (value: V, key: K) => R
    ) {
        return new Map(
            Array.from(source, v => [v[0], transformer(v[1], v[0])])
        )
    }

    static groupByAndMap<T, K, R>(
        array: T[],
        grouper: (x: T) => K,
        mapper: (x: T[], key: K) => R
    ) {
        let groups = Utils.groupBy(array, grouper)
        return Utils.transformMap(groups, (value, key) => mapper(value, key))
    }

    static sortDir(descending: boolean | string) {
        return Utils.toBool(descending) ? "desc" : "asc"
    }

    static orderClause(path: string, descending: boolean | string) {
        return path.split(".").reduceRight((obj, field, idx, arr) => {
            return { [field]: (idx == arr.length - 1) ? Utils.sortDir(descending) : obj }
        }, {})
    }

    static where(param: any, cond: object) {
        return param ? cond : { }
    }

    static async tableHandler<T>(
        entityClass: EntityClass<T>,
        repository: Repository<unknown>,
        { page, limit, sortBy, descending, filter }: Partial<TableParams>,
        searchFields: string[] = []): Promise<ReturnType> {
        const where = searchFields.length > 0 && filter
            ? { [searchFields[0]]: Like(`${filter}%`) }
            : undefined
        const [ rows, count ] = await repository.findAndCount({
                where,
                skip: (page != undefined) ? (Utils.toInt(page) - 1) * Utils.toInt(limit) : undefined,
                take: (page != undefined) ? Utils.toInt(limit) : undefined,
                order: { [sortBy]: Utils.toBool(descending) ? "desc": "asc" }
            })

        return (page != undefined) ? [PaginatedList(entityClass, rows, count)] : rows
    }
}

