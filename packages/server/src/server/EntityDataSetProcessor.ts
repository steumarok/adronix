import Graph from "graph-data-structure"
import { EntityClass, EntityId, Transaction, TransactionManager } from '@adronix/persistence'
import { ItemData, ItemId } from "./types"
import { DataSetProcessor } from "./DataSetProcessor"
import { Module } from "./Module"
import { Application, CallContext } from "./Application"
import { IncomingMessage, ServerResponse } from "http"

function groupBy<K, V>(array: V[], grouper: (item: V) => K) {
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

function transformMap<K, V, R>(
    source: Map<K, V>,
    transformer: (value: V, key: K) => R
) {
    return new Map(
        Array.from(source, v => [v[0], transformer(v[1], v[0])])
    )
}

function groupByAndMap<T, K, R>(
    array: T[],
    grouper: (x: T) => K,
    mapper: (x: T[]) => R
) {
    let groups = groupBy(array, grouper)
    return transformMap(groups, value => mapper(value))
}


export abstract class EntityDataSetProcessor extends DataSetProcessor {

    constructor(module: Module<Application>) {
        super(module)
    }

    /*protected getEntityIOMap() {
        return this.module.app.getEntityIOMap()
    }*/

    protected mapEntityId(idMap: Map<string, any>, type: string, tempId: EntityId, entity: any) {
        idMap.set(`${tempId}@${type}`, entity)
    }

    validate(data: ItemData[]) { }

    protected getEntityClassByName(name: string) {
        return this.module.app.getEntityClassByName(name)
    }

    protected prepareDataForIO(itemData: ItemData, idMap: Map<string, any>, context: CallContext) {
        const data = {}
        for (let key in itemData) {
            if (!key.startsWith("$")) {
                const value = itemData[key]
                if (typeof value == "object") {
                    if (value.$idRef) {
                        data[key] = () => this.resolveEntityRef(
                            value.$type,
                            value.$idRef,
                            idMap,
                            context)
                    }
                }
                else {
                    data[key] = value
                }
            }
        }
        return data
    }

    protected resolveEntityRef(type: string, idRef: ItemId, idMap: Map<string, any>, context: CallContext) {
        const tempKey = `${idRef}@${type}`

        if (idMap.has(tempKey)) {
            return Promise.resolve(idMap.get(tempKey))
        }
        else {
            const entityIO = this.getEntityIO(type, context)
            return entityIO.get(idRef)
        }
    }

    protected getEntityIO(type: string | EntityClass<unknown>, context: CallContext) {
       return this.module.app.getEntityIO(type, context)
    }

    protected async processItem(itemData: ItemData, idMap: Map<string, any>, context: CallContext) {
        const entityIO = this.getEntityIO(itemData.$type, context)

        const changes = this.prepareDataForIO(itemData, idMap, context)

        if (itemData.$inserted) {
            return await entityIO.insert(changes)
        }
        else if (itemData.$deleted) {
            const entity = await entityIO.get(itemData.$id)
            return entityIO.delete(entity)
        }
        else {
            const entity = await entityIO.get(itemData.$id)
            return await entityIO.update(entity, changes)
        }
    }

    async sync(
        data: ItemData[],
        context: CallContext) {

        const graph = Graph()
        data.map(itemData => {
            const parentNode = `${itemData.$id}@${itemData.$type}`
            graph.addNode(parentNode)
            for (let propName in itemData) {
                if (!propName.startsWith("$")) {
                    if (typeof itemData[propName] == "object" && itemData[propName].$idRef) {
                        const childNode = `${itemData[propName].$idRef}@${itemData[propName].$type}`
                        graph.addNode(childNode)
                        graph.addEdge(childNode, parentNode)

                    }
                    else if (Array.isArray(itemData[propName])) {
                        for (let element of itemData[propName]) {
                            if (typeof element == "object" && element.$idRef) {
                                const childNode = `${element[propName].$idRef}@${element[propName].$type}`
                                graph.addNode(childNode)
                                graph.addEdge(childNode, parentNode)
                            }
                        }
                    }
                }
            }
        })

        const ordered = graph.topologicalSort()
        data.sort((a, b) => ordered.indexOf(`${a.$id}@${a.$type}`) - ordered.indexOf(`${b.$id}@${b.$type}`))

        const idMap: Map<string, any> = new Map()

        const transactionManagerMap = this.getTransactionManagerMap(data, context)

        const processedItems = await Promise.all(
            data.map(async itemData => {
                const entityClass = this.getEntityClassByName(itemData.$type)
                return {
                    itemData,
                    entityClass,
                    actionOrErrors: await this.processItem(itemData, idMap, context)
                }
            })
        )

        const operations = new Array<{
            action: (tx: Transaction) => Promise<any>,
            entityClass: EntityClass<unknown>,
            entityId: EntityId
        }>()
        const itemsWithErrors = []

        processedItems.forEach(async ({ itemData, entityClass, actionOrErrors }) => {

            if (typeof actionOrErrors == "function") {
                operations.push({
                    action: actionOrErrors,
                    entityClass,
                    entityId: itemData.$id
                })
            }
            else {
                itemsWithErrors.push({
                    $id: itemData.$id,
                    $type: itemData.$type,
                    $errors: actionOrErrors
                } as ItemData)
            }
        })

        if (itemsWithErrors.length > 0) {
            return { data: itemsWithErrors, status: 400 }
        }

        const transactionMap = this.createTransactions(transactionManagerMap)

        const transactions = Array.from(transactionMap.values())
        await Promise.all(transactions.map(t => t.start()))

        try {
            const collector = this.module.app.getEntityClasses()
                .reduce((c, entityClass) => c.describe(entityClass), this.createCollector())

            for (const op of operations) {
                const entity = await op.action(transactionMap.get(op.entityClass))

                if (entity) {
                    const io = this.getEntityIO(op.entityClass, context)

                    this.mapEntityId(
                        idMap,
                        op.entityClass.name,
                        op.entityId,
                        entity)

                    collector.addOne(entity)

                    const id = io.getEntityId(entity)

                    if (id != op.entityId) {
                        collector.addMappedId(id, op.entityId)
                    }
                }
            }

            await Promise.all(transactions.map(t => t.commit()))

            return { data: collector.get(), status: 200 }
        }
        catch (e) {
            await Promise.all(transactions.map(t => t.rollback()))

            throw e
        }
    }

    protected getTransactionManagerMap(
        data: ItemData[],
        context: CallContext): Map<EntityClass<unknown>, TransactionManager> {
        return new Map(
            data.map(itemData => {
                const entityClass = this.getEntityClassByName(itemData.$type)
                return [ entityClass, this.getEntityIO(entityClass, context).transactionManager ]
            })
        )
    }

    protected createTransactions(
        transactionManagerMap: Map<EntityClass<unknown>, TransactionManager>): Map<EntityClass<unknown>, Transaction> {
        const a = Array.from(transactionManagerMap.entries())
        const r = groupByAndMap(a, x => x[1].createTransaction(), x => x.reduce((v, c) => v.concat([c[0]]), [] as EntityClass<unknown>[]))
        const map: Map<EntityClass<unknown>, Transaction> = new Map()
        r.forEach((entityClasses, tm) => {
            entityClasses.forEach(entityClass => {
                map.set(entityClass, tm)
            })
        })
        return map
    }


}