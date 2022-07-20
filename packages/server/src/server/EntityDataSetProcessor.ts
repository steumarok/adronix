import Graph from "graph-data-structure"
import { EntityClass, EntityId, Transaction, TransactionManager } from '@adronix/persistence'
import { ItemData, ItemId } from "./types"
import { DataSetProcessor } from "./DataSetProcessor"
import { Module } from "./Module"
import { Application } from "./Application"

export abstract class EntityDataSetProcessor extends DataSetProcessor {

    constructor(protected module: Module<Application>) {
        super()
    }

    protected getEntityIOMap() {
        return this.module.app.getEntityIOMap()
    }

    protected mapEntityId(idMap: Map<string, any>, type: string, tempId: EntityId, entity: any) {
        idMap.set(`${tempId}@${type}`, entity)
    }

    validate(data: ItemData[]) { }

    protected getEntityClassByName(name: string) {
        return this.module.app.getEntityClassByName(name)
    }

    protected prepareDataForIO(itemData: ItemData, idMap: Map<string, any>) {
        const data = {}
        for (let key in itemData) {
            if (!key.startsWith("$")) {
                const value = itemData[key]
                if (typeof value == "object") {
                    if (value.$idRef) {
                        data[key] = () => this.resolveEntityRef(value.$type, value.$idRef, idMap)
                    }
                }
                else {
                    data[key] = value
                }
            }
        }
        return data
    }

    protected resolveEntityRef(type: string, idRef: ItemId, idMap: Map<string, any>) {
        const tempKey = `${idRef}@${type}`

        if (idMap.has(tempKey)) {
            return Promise.resolve(idMap.get(tempKey))
        }
        else {
            const entityIO = this.getEntityIO(type)
            return entityIO.get(idRef)
        }
    }

    protected getEntityIO(type: string | EntityClass<unknown>) {
       return this.module.app.getEntityIO(type)
    }

    protected async processItem(itemData: ItemData, idMap: Map<string, any>) {
        const entityIO = this.getEntityIO(itemData.$type)

        const changes = this.prepareDataForIO(itemData, idMap)

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

    async sync(data: ItemData[]) {

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

        const processedItems = await Promise.all(
            data.map(async itemData => {
                const entityClass = this.getEntityClassByName(itemData.$type)
                return {
                    itemData,
                    entityClass,
                    actionOrErrors: await this.processItem(itemData, idMap)
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
            return itemsWithErrors
        }

        const transactionMap = this.createTransactions()

        const ioTransactionMap = new Map<EntityClass<unknown>, Transaction>()
        this.getEntityIOMap().forEach((value, key) => {
            ioTransactionMap.set(key, transactionMap.get(value.transactionManager))
        })

        const transactions = Array.from(transactionMap.values())
        await Promise.all(transactions.map(t => t.start()))

        try {
            const collector = Array
                .from(this.getEntityIOMap().keys())
                .reduce((c, entityClass) => c.describe(entityClass), this.createCollector())

            for (let op of operations) {
                const entity = await op.action(ioTransactionMap.get(op.entityClass))

                if (entity) {
                    const io = this.getEntityIO(op.entityClass)

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

            return collector.get()
        }
        catch (e) {
            await Promise.all(transactions.map(t => t.rollback()))

            throw e
        }
    }

    protected createTransactions(): Map<TransactionManager, Transaction> {
        const transactionMap = new Map<TransactionManager, Transaction>()
        this.getTransactionManagers().forEach(tm => {
            transactionMap.set(tm, tm.createTransaction())
        })
        return transactionMap
    }

    protected getTransactionManagers() {
        return new Set(Array.from(this.getEntityIOMap().values()).map(v => v.transactionManager))
    }

}