import Graph from "graph-data-structure"
import { EntityClass, EntityId, EntityIO, Transaction, TransactionManager } from '@adronix/persistence'
import { ItemData, ItemId } from "./types"
import { DataSetProcessor } from "./DataSetProcessor"

export abstract class EntityDataSetProcessor extends DataSetProcessor {

    private entityIOMap = new Map<EntityClass<unknown>, {
        entityIO: EntityIO<unknown, Transaction>,
        transactionManager: TransactionManager<Transaction>
    }>()
    private idMap: Map<string, any> = new Map()

    constructor() {
        super()
    }

    protected addEntityIO<T, Tx extends Transaction>(
        entityClass: EntityClass<T>,
        entityIO: EntityIO<T, Tx>,
        transactionManager: TransactionManager<Tx>) {
        this.entityIOMap.set(entityClass, { entityIO, transactionManager })
    }

    protected mapEntityId(type: string, tempId: EntityId, newId: EntityId) {
        this.idMap.set(`${tempId}@${type}`, newId)
    }

    validate(data: ItemData[]) {

    }

    protected getEntityClassByName(name: string) {
        return Array.from(this.entityIOMap.keys()).find(c => c.name == name)
    }

    protected prepareDataForIO(itemData: ItemData) {
        const data = {}
        for (let key in itemData) {
            if (!key.startsWith("$")) {
                const value = itemData[key]
                if (typeof value == "object") {
                    if (value.$idRef) {
                        data[key] = () => this.resolveEntityRef(value.$type, value.$idRef)
                    }
                }
                else {
                    data[key] = value
                }
            }
        }
        return data
    }

    protected resolveEntityRef(type: string, idRef: ItemId) {
        const tempKey = `${idRef}@${type}`

        if (this.idMap.has(tempKey)) {
            return Promise.resolve(this.idMap.get(tempKey))
        }
        else {
            const entityIO = this.getEntityIO(type)
            return entityIO.get(idRef)
        }
    }

    protected getEntityIO(type: string | EntityClass<unknown>) {
        const entityClass = typeof type == "string" ? this.getEntityClassByName(type) : type
        const { entityIO } = this.entityIOMap.get(entityClass)
        return entityIO
    }

    protected async processItem(itemData: ItemData) {
        const entityIO = this.getEntityIO(itemData.$type)

        const changes = this.prepareDataForIO(itemData)

        if (itemData.$inserted) {
            console.log("itemData", itemData)
            return entityIO.insert(changes)
        }
        else if (itemData.$deleted) {
            throw "not imp"
        }
        else {
            const entity = await entityIO.get(itemData.$id)
            return entityIO.update(entity, changes)
        }
    }

    async sync(data: ItemData[]) {

        const operations = new Array<{
            action: (tx: Transaction) => Promise<any>,
            entityClass: EntityClass<unknown>,
            entityId: EntityId
        }>()

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

        data.forEach(async itemData => {

            const entityClass = this.getEntityClassByName(itemData.$type)

            const action = await this.processItem(itemData)

            if (typeof action == "function") {
                operations.push({
                    action,
                    entityClass,
                    entityId: itemData.$id
                })
            }

        })

        const transactionMap = this.createTransactions()

        const ioTransactionMap = new Map<EntityClass<unknown>, Transaction>()
        this.entityIOMap.forEach((value, key) => {
            ioTransactionMap.set(key, transactionMap.get(value.transactionManager))
        })

        await Promise.all(Array.from(transactionMap.values()).map(t => t.start()))

        try {
            for (let op of operations) {
                const entity = await op.action(ioTransactionMap.get(op.entityClass))
                this.mapEntityId(op.entityClass.name, op.entityId, entity)
            }

            await Promise.all(Array.from(transactionMap.values()).map(t => t.commit()))
        }
        catch (e) {
            await Promise.all(Array.from(transactionMap.values()).map(t => t.rollback()))
        }

        console.log(this.idMap)

        return []
    }

    protected createTransactions(): Map<TransactionManager<Transaction>, Transaction> {
        const transactionMap = new Map<TransactionManager<Transaction>, Transaction>()
        this.getTransactionManagers().forEach(tm => {
            transactionMap.set(tm, tm.createTransaction())
        })
        return transactionMap
    }

    protected getTransactionManagers() {
        return new Set(Array.from(this.entityIOMap.values()).map(v => v.transactionManager))
    }

}