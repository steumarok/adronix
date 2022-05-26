import { Transaction } from "./Transaction";

export abstract class TransactionManager<T extends Transaction> {
    abstract createTransaction(): T
}
