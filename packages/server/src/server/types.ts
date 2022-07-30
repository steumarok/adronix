import { Errors, ItemError } from "@adronix/base/src"
import { EntityClass } from "@adronix/persistence/src"
import { AbstractService } from "./AbstractService"
import { Application } from "./Application"
import { HttpContext } from "./Context"
import { IServiceProxy } from "./IServiceProxy"
import { ItemCollector } from "./ItemCollector"
import { Module } from "./Module"

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
export type Rule = {
    expr: () => boolean,
    error: ItemError
}


export type Params = { [name: string]: any }
export type ReturnType = ((collector: ItemCollector) => ItemCollector) | any


export type DataProvider<C = {}> = (
    this: HttpContext & C,
    params: Partial<Params>,
    items?: any[]
) => Promise<ReturnType[]>

export type DataProviderDefinitions<C = {}> =  {
    [key: string]: {
        handler: DataProvider<C>,
        output: [ EntityClass<unknown>, ...string[] ][]
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


export type FormRuleExpr = (this: HttpContext, payload: any) => boolean
export type AsyncFormRuleExpr = (this: HttpContext, payload: any) => Promise<boolean>

export type FormHandler = (this: HttpContext, payload: any) => Promise<any>

export type FormDefinitions =  {
    [key: string]: {
        handler: FormHandler,
        rules: [ string, FormRuleExpr | AsyncFormRuleExpr, ItemError][]
    }
}