import { Transaction } from "./Transaction"
import { Validator, Error } from "@adronix/base"
import { Context } from "@adronix/server"

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

export type BaseRuleExpr<R> = (this: Context, changes: EntityProps, entity: any, ruleName: string, entityClass: EntityClass<unknown>) => R
export type RuleExpr = BaseRuleExpr<boolean>
export type AsyncRuleExpr = BaseRuleExpr<Promise<boolean>>

export type Rule = {
    name: string,
    expr: RuleExpr | AsyncRuleExpr,
    error: Error
}

export type EntityClass<T> = new (...args: any[]) => T

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
export type TransactionEventHandler = (eventKind: TransactionEventKind) => Promise<void>

export type ValidationHandler<T> = (validator: Validator, changes: EntityProps, entity?: T) => Validator

export type EntityIORule = [ AsyncRuleExpr | RuleExpr, Error]
export type EntityIORules = { [name: string]: EntityIORule[] | EntityIORule }
export type EntityIODefinitions = {
    entityClass: EntityClass<unknown>,
    rules?: EntityIORules
}[]

export type PersistenceExtension = { eventHandlers: [ EntityClass<unknown>, EntityEventHandler ][]}
