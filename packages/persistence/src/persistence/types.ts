import { Transaction } from "./Transaction"
import { Validator } from "./Validator"

export type EntityId = string | number
export type EntityProps = {
    [key: string]: any
}
export type EntityData = {
  $id: EntityId
  $type: string
  $inserted?: boolean
  $deleted?: boolean
  $index?: number
  [key: string]: any
}
export type ItemRef = {
    $idRef: EntityId
    $type: string
}

export type ItemError = {
    code?: string,
    message: string
}
export type Errors = {
    [key: string]: ItemError[]
}


export type DataMap = Map<string, EntityData>
export type IdGetter = (item: any) => EntityId
export type DescriptorMap = Map<any, { propNames: string[], idGetter: IdGetter }>
export type Rule = {
    expr: () => boolean,
    error: ItemError
}

export type EntityClass<T> = new () => T

export enum EntityEventKind {
    Insert,
    Update,
    Delete
}

export enum TransactionEventKind {
    Commit,
    Rollback
}

export type EntityEventHandler<T, Tx extends Transaction> = (eventKind: EntityEventKind, entity: T, transaction: Tx) => void
export type TransactionEventHandler = (eventKind: TransactionEventKind) => void

export type ValidationHandler<T> = (validator: Validator, changes: EntityProps, entity?: T) => Validator
