import { Errors, Error } from "@adronix/base"
import { EntityClass } from "@adronix/persistence"
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


export type DataProviderContext = {
    output: OutputExtender
}

export type DataProvider<C = {}> = (
    this: HttpContext & DataProviderContext & C,
    params: Partial<Params>,
    items?: any[]
) => Promise<ReturnType[]>

export type DataProviderDefinitions<C = {}> =  {
    [key: string]: {
        handler: DataProvider<C>,
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