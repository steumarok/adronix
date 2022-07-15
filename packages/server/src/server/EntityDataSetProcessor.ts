import Graph from "graph-data-structure"
import { EntityClass, EntityId, EntityIO, Transaction, TransactionManager } from '@adronix/persistence'
import { ItemData, ItemId } from "./types"
import { DataSetProcessor } from "./DataSetProcessor"

export abstract class EntityDataSetProcessor extends DataSetProcessor {

    private entityIOMap = new Map<EntityClass<unknown>, {
        entityIO: EntityIO<unknown, Transaction>,
        transactionManager: TransactionManager<Transaction>
    }>()

    constructor() {
        super()
    }

    protected addEntityIO<T, Tx extends Transaction>(
        entityClass: EntityClass<T>,
        entityIO: EntityIO<T, Tx>,
        transactionManager: TransactionManager<Tx>) {
        this.entityIOMap.set(entityClass, { entityIO, transactionManager })

        // entityIO.addEventHandler()
    }

    protected mapEntityId(idMap: Map<string, any>, type: string, tempId: EntityId, entity: any) {
        idMap.set(`${tempId}@${type}`, entity)
    }

    validate(data: ItemData[]) { }

    protected getEntityClassByName(name: string) {
        return Array.from(this.entityIOMap.keys()).find(c => c.name == name)
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
        const entityClass = typeof type == "string" ? this.getEntityClassByName(type) : type
        const { entityIO } = this.entityIOMap.get(entityClass)
        return entityIO
    }

    protected async processItem(itemData: ItemData, idMap: Map<string, any>) {
        const entityIO = this.getEntityIO(itemData.$type)

        const changes = this.prepareDataForIO(itemData, idMap)

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

        const idMap: Map<string, any> = new Map()

        data.forEach(async itemData => {

            const entityClass = this.getEntityClassByName(itemData.$type)

            const action = await this.processItem(itemData, idMap)

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

        const transactions = Array.from(transactionMap.values())
        await Promise.all(transactions.map(t => t.start()))

        try {
            const collector = Array
                .from(this.entityIOMap.keys())
                .reduce((c, entityClass) => c.describe(entityClass), this.createCollector())

            for (let op of operations) {
                const entity = await op.action(ioTransactionMap.get(op.entityClass))

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

            await Promise.all(transactions.map(t => t.commit()))

            return collector.get()
        }
        catch (e) {
            console.log(e)

            await Promise.all(transactions.map(t => t.rollback()))

            return []
        }
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