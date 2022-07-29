import { Errors, ItemError } from "@adronix/base/src"
import { EntityClass } from "@adronix/persistence/src"
import { AbstractService } from "./AbstractService"
import { Application, CallContext } from "./Application"
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

export type ThisModule<A extends Application> = {
    module: Module<A>,
    app: A;
    context: CallContext;
}

export type DataProvider<A extends Application> = (
    this: ThisModule<A>,
    params: Partial<Params>,
    items?: any[]
) => Promise<ReturnType[]>

export type DataProviderDefintions<A extends Application = Application> =  {
    [key: string]: {
        handler: DataProvider<A>,
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
    web: {
        urlContext?: string,
    }
}

export type FormThis<A extends Application> = {
    app: A;
    context: CallContext;
}

export type FormRuleExpr<A extends Application> = (this: FormThis<A>, payload: any) => boolean
export type AsyncFormRuleExpr<A extends Application> = (this: FormThis<A>, payload: any) => Promise<boolean>

export type FormHandler<A extends Application> = (this: FormThis<A>, payload: any) => Promise<any>

export type FormDefinitions<A extends Application = Application> =  {
    [key: string]: {
        handler: FormHandler<A>,
        rules: [ string, FormRuleExpr<A> | AsyncFormRuleExpr<A>, ItemError][]
    }
}