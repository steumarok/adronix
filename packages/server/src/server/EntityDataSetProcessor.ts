import Graph from "graph-data-structure"
import { EntityClass, EntityId, EntityProps, Transaction, TransactionManager } from '@adronix/persistence'
import { ItemData, ItemId } from "./types"
import { DataSetProcessor } from "./DataSetProcessor"
import { Module } from "./Module"
import { Application } from "./Application"
import { IOService } from "./IOService"
import { HttpContext } from "./Context"
import { Utils } from "./utils"



export abstract class EntityDataSetProcessor extends DataSetProcessor {

    constructor(module: Module<Application>) {
        super(module)
    }

    protected mapEntityId(idMap: Map<string, any>, type: string, tempId: EntityId, entity: any) {
        idMap.set(`${tempId}@${type}`, entity)
    }

    validate(data: ItemData[]) { }

    protected getEntityClassByName(name: string, ioService: IOService) {
        return ioService.getEntityClassByName(name)
    }

    protected prepareDataForIO(itemData: ItemData, idMap: Map<string, any>, ioService: IOService) {
        const data = {}
        for (let key in itemData) {
            if (!key.startsWith("$")) {
                const value = itemData[key]
                if (Array.isArray(value)) {
                    data[key] = () => {
                        return Promise.all(value.map(element => {
                            if (typeof element == "object") {
                                return this.resolveEntityRef(
                                    element.$type,
                                    element.$idRef,
                                    idMap,
                                    ioService)
                            } else {
                                return element
                            }
                        }))
                    }
                }
                else if (value != null && typeof value == "object") {
                    if (value.$idRef) {
                        data[key] = () => this.resolveEntityRef(
                            value.$type,
                            value.$idRef,
                            idMap,
                            ioService)
                    }
                }
                else {
                    data[key] = value
                }
            }
        }
        return data
    }

    protected resolveEntityRef(type: string, idRef: ItemId, idMap: Map<string, any>, ioService: IOService) {
        const tempKey = `${idRef}@${type}`

        if (idMap.has(tempKey)) {
            return Promise.resolve(idMap.get(tempKey))
        }
        else {
            return ioService.get(type, idRef)
        }
    }

    protected async processItem(context: HttpContext, itemData: ItemData, idMap: Map<string, any>, ioService: IOService) {
        const changes = this.prepareDataForIO(itemData, idMap, ioService)

        if (itemData.$inserted) {
            return await this.insert(context, itemData.$type, changes, ioService)  // await ioService.insert(itemData.$type, changes)
        }
        else if (itemData.$deleted) {
            const entity = await ioService.get(itemData.$type, itemData.$id)
            return await this.delete(context, itemData.$type, changes, entity, ioService) //ioService.delete(itemData.$type, entity)
        }
        else {
            const entity = await ioService.get(itemData.$type, itemData.$id)
            return await this.update(context, itemData.$type, changes, entity, ioService)  // await ioService.update(itemData.$type, entity, changes)
        }
    }

    async insert(
        _context: HttpContext,
        itemType: string,
        changes: EntityProps,
        ioService: IOService) {
        return await ioService.insert(itemType, changes)
    }

    async update(
        _context: HttpContext,
        itemType: string,
        changes: EntityProps,
        entity: any,
        ioService: IOService) {
        return await ioService.update(itemType, entity, changes)
    }

    async delete(
        _context: HttpContext,
        itemType: string,
        changes: EntityProps,
        entity: any,
        ioService: IOService) {
        return await ioService.delete(itemType, entity)
    }

    async sync(
        data: ItemData[],
        context: HttpContext) {

        const ioService = context.service(IOService)

        const graph = Graph()
        data.map(itemData => {
            const parentNode = `${itemData.$id}@${itemData.$type}`
            graph.addNode(parentNode)
            for (let propName in itemData) {
                if (!propName.startsWith("$") &&
                    itemData[propName] != null) {
                    if (typeof itemData[propName] == "object" && itemData[propName].$idRef) {
                        const childNode = `${itemData[propName].$idRef}@${itemData[propName].$type}`
                        graph.addNode(childNode)
                        graph.addEdge(childNode, parentNode)

                    }
                    else if (Array.isArray(itemData[propName])) {
                        for (let element of itemData[propName]) {
                            if (typeof element == "object" && element.$idRef) {
                                const childNode = `${element.$idRef}@${element.$type}`
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

        const transactionManagerMap = this.getTransactionManagerMap(data, ioService)

        const processedItems = await Promise.all(
            data.map(async itemData => {
                const entityClass = this.getEntityClassByName(itemData.$type, ioService)
                return {
                    itemData,
                    entityClass,
                    actionOrErrors: await this.processItem(context, itemData, idMap, ioService)
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

        const transactions = Array.from(new Set(transactionMap.values()))
        await Promise.all(transactions.map(t => t.start()))

        try {
            const collector = ioService.getEntityClasses()
                .reduce((c, entityClass) => c.describe(entityClass), this.createCollector())

            for (const op of operations) {
                const entity = await op.action(transactionMap.get(op.entityClass))

                if (entity) {
                    this.mapEntityId(
                        idMap,
                        op.entityClass.name,
                        op.entityId,
                        entity)

                    collector.addOne(entity)

                    const id = ioService.getEntityId(op.entityClass, entity)

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
        ioService: IOService): Map<EntityClass<unknown>, TransactionManager> {
        return new Map(
            data.map(itemData => {
                const entityClass = this.getEntityClassByName(itemData.$type, ioService)
                return [ entityClass, ioService.getTransactionManager(entityClass) ]
            })
        )
    }

    protected createTransactions(
        transactionManagerMap: Map<EntityClass<unknown>, TransactionManager>): Map<EntityClass<unknown>, Transaction> {
        const a = Array.from(transactionManagerMap.entries())
        const r = Utils.groupByAndMap(a, x => x[1], x => x.reduce((v, c) => v.concat([c[0]]), [] as EntityClass<unknown>[]))
        const map: Map<EntityClass<unknown>, Transaction> = new Map()
        r.forEach((entityClasses, tm) => {
            const transaction = tm.createTransaction()
            entityClasses.forEach(entityClass => {
                map.set(entityClass, transaction)
            })
        })
        return map
    }


}