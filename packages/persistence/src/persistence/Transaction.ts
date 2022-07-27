import { PersistenceContext } from "./PersistenceContext"
import { TransactionEventHandler, TransactionEventKind } from "./types"

export class Transaction {
    private eventHandlers: TransactionEventHandler[] = []

    constructor(public readonly context: PersistenceContext) { }

    async start() { }

    async commit() {
        this.eventHandlers.forEach(handler => handler(TransactionEventKind.Commit))

        this.eventHandlers = []
    }

    async rollback() {
        this.eventHandlers.forEach(handler => handler(TransactionEventKind.Rollback))

        this.eventHandlers = []
    }

    addEventHandler(handler: TransactionEventHandler) {
        this.eventHandlers.push(handler)
    }
}