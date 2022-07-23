import { EntityClass } from "@adronix/persistence/src"
import { Application } from "./Application"
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

export type ItemError = {
    code?: string,
    message: string
}
export type Errors = {
    [key: string]: ItemError[]
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


export type DataProvider<A extends Application> = (this: Module<A>, params: Partial<Params>, items?: any[]) => Promise<ReturnType[]>

export type DataProviderDefintions<A extends Application> =  {
    [key: string]: {
        handler: DataProvider<A>,
        output: [ EntityClass<unknown>, ...string[] ][]
    }
}

export type ModuleOptions = {
    urlContext?: string
}
