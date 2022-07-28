import { ItemError } from "packages/base"
import { IPersistenceManager } from "./IPersistenceManager"
import { Transaction } from "./Transaction"
import { Validator } from "@adronix/base"
import { PersistenceContext } from "./PersistenceContext"

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



export type DataMap = Map<string, EntityData>
export type IdGetter = (item: any) => EntityId
export type DescriptorMap = Map<any, { propNames: string[], idGetter: IdGetter }>

export type RuleThis = {
    manager: IPersistenceManager;
    context: PersistenceContext;
}

export type RuleExpr = (this: RuleThis, changes: EntityProps, entity?: any) => boolean
export type AsyncRuleExpr = (this: RuleThis, changes: EntityProps, entity?: any) => Promise<boolean>
export type Rule = {
    name: string,
    expr: RuleExpr | AsyncRuleExpr,
    error: ItemError
}

export type EntityClass<T> = new () => T

export enum EntityEventKind {
    Inserting,
    Updating,
    Deleting,
    Inserted,
    Updated,
    Deleted
}

export enum TransactionEventKind {
    Commit,
    Rollback
}

export type EntityEventHandler<T = any> = (eventKind: EntityEventKind, entity: T, transaction: Transaction) => Promise<void>
export type TransactionEventHandler = (eventKind: TransactionEventKind) => void

export type ValidationHandler<T> = (validator: Validator, changes: EntityProps, entity?: T) => Validator

export type EntityIODefinitions = {
    entityClass: EntityClass<unknown>,
    rules: [ string, AsyncRuleExpr | RuleExpr, ItemError][]
}[]

export type PersistenceExtension = { eventHandlers: [ EntityClass<unknown>, EntityEventHandler ][]}
