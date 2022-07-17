import { TransactionEventHandler, TransactionEventKind } from "./types"

export class Transaction {
    private eventHandlers: TransactionEventHandler[] = []

    async start() { }

    async commit() {
        this.eventHandlers.forEach(handler => handler(TransactionEventKind.Commit))
    }

    async rollback() {
        this.eventHandlers.forEach(handler => handler(TransactionEventKind.Rollback))
    }

    addEventHandler(handler: TransactionEventHandler) {
        this.eventHandlers.push(handler)
    }
}