import { Context } from "@adronix/server"
import { TransactionEventHandler, TransactionEventKind } from "./types"

export class Transaction {
    private eventHandlers: TransactionEventHandler[] = []

    constructor(public readonly context: Context) { }

    async start() { }

    async commit() {
        for (const handler of this.eventHandlers) {
            await handler(TransactionEventKind.Commit)
        }

        this.eventHandlers = []
    }

    async rollback() {
        for (const handler of this.eventHandlers) {
            await handler(TransactionEventKind.Rollback)
        }

        this.eventHandlers = []
    }

    addEventHandler(handler: TransactionEventHandler) {
        this.eventHandlers.push(handler)
    }
}