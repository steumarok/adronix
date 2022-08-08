const Url = require('domurl')

export function buildUrl(baseUrl: string, params: { [name: string]: any }) {

    const url = new Url(baseUrl)
    for (const name in params) {
        if (params[name] != null && params[name] != undefined) {
            url.query[name] = params[name]
        }
    }

    return url.toString()
}

//
// from https://www.steveruiz.me/posts/how-to-filter-an-object
//
type Entry<T> = {
    [K in keyof T]: [K, T[K]]
  }[keyof T]
export function filterObject<T extends object>(
    obj: T,
    fn: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean
) {
    return Object.fromEntries(
        (Object.entries(obj) as Entry<T>[]).filter(fn)
    ) as Partial<T>
}

export function groupBy<K, V>(array: V[], grouper: (item: V) => K) {
    return array.reduce((store, item) => {
        var key = grouper(item)
        if (!store.has(key)) {
            store.set(key, [item])
        } else {
            store.get(key)!.push(item)
        }
        return store
    }, new Map<K, V[]>())
}

export function  transformMap<K, V, R>(
    source: Map<K, V>,
    transformer: (value: V, key: K) => R
) {
    return new Map(
        Array.from(source, v => [v[0], transformer(v[1], v[0])])
    )
}

export function  groupByAndMap<T, K, R>(
    array: T[],
    grouper: (x: T) => K,
    mapper: (x: T[], key: K) => R
) {
    let groups = groupBy(array, grouper)
    return transformMap(groups, (value, key) => mapper(value, key))
}