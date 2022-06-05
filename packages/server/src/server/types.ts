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

// export type EntityClass<T> = new () => T
