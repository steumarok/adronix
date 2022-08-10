import { Errors, Error } from "@adronix/base"
import { EntityClass, Transaction } from "@adronix/persistence"
import { AbstractService } from "./AbstractService"
import { Application } from "./Application"
import { HttpContext } from "./Context"
import { OutputExtender } from "./DataSetProcessor"
import { IServiceProxy } from "./IServiceProxy"
import { ItemCollector } from "./ItemCollector"

export type ItemId = string | number
export type ItemProps = {
    [key: string]: any
}
export type ItemData = {
  $id: ItemId
  $type: string
  $inserted?: boolean
  $deleted?: boolean
  $index?: number
  $mappedId?: ItemId
  $errors?: Errors
  [key: string]: any
}
export type ItemRef = {
    $idRef: ItemId
    $type: string
}

export type DataMap = Map<string, ItemData>
export type IdGetter = (item: any) => ItemId
export type DescriptorMap = Map<any, { propNames: string[], idGetter: IdGetter }>



export type Params = { [name: string]: any }
export type ReturnType = ((collector: ItemCollector) => ItemCollector) | any


export type DataProviderContext = HttpContext & {
    output: OutputExtender
}

export type DataProvider<C = {}> = (
    this: DataProviderContext & C,
    params: Partial<Params>,
    items?: any[]
) => Promise<ReturnType[]>

export type Action<R, C = {}> = (
    this: DataProviderContext & C,
    tx: Transaction
) => Promise<R>
export type ActionOrErrors<R, C = {}> = Errors | Action<R, C>


export type SyncHandler<C = {}> = (
    this: DataProviderContext & C,
    changes: ItemProps,
    entity: any,
) => Promise<Action<void, C>>



export type SyncConfig<C = {}> = {
    onBeforeInsert?: [ EntityClass<unknown>, SyncHandler<C> ][],
    onAfterInsert?: [ EntityClass<unknown>, SyncHandler<C> ][],
    onBeforeUpdate?: [ EntityClass<unknown>, SyncHandler<C> ][],
    onAfterUpdate?: [ EntityClass<unknown>, SyncHandler<C> ][],
    onBeforeDelete?: [ EntityClass<unknown>, SyncHandler<C> ][],
    onAfterDelete?: [ EntityClass<unknown>, SyncHandler<C> ][],
}

export type DataProviderDefinitions<C = {}> =  {
    [key: string]: {
        handler: DataProvider<C>,
        sync?: SyncConfig<C>,
        output?: [ EntityClass<unknown>, ...string[] ][]
    }
}


export type ServiceOptions = {
    proxy?: IServiceProxy
}

export type ModuleOptions = {
    secured?: boolean
    services?: [ typeof AbstractService<Application>, ServiceOptions ][]
}

export type WebModuleOptions = ModuleOptions & {
    http: {
        urlContext?: string,
    }
}


export type BaseFormRuleExpr<R> = (this: HttpContext, payload: any, name: string) => R
export type FormRuleExpr = BaseFormRuleExpr<boolean>
export type AsyncFormRuleExpr =  BaseFormRuleExpr<Promise<boolean>>

export type FormHandler = (this: HttpContext, payload: any) => Promise<Errors | void>

export type FormRule = [ AsyncFormRuleExpr | FormRuleExpr, Error ]
export type FormRules = { [name: string]: FormRule | FormRule[]}

export type FormDefinitions =  {
    [key: string]: {
        handler: FormHandler,
        rules?: FormRules
    }
}