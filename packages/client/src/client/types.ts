import { Item } from "./Item"

export type ItemId = string | number

export type ItemRef = {
  $idRef: ItemId
  $type: string
}
export type BaseType = number | string | bigint | boolean| null | undefined | object | ItemRef | Item
export type ItemProp = BaseType | BaseType[]
export type ItemProps = { id: ItemId, [key: string]: ItemProp }
export type ItemFilter = (item: Item) => boolean
export type QuerySortFn = (a: ItemProps, b: ItemProps) => number

export type ItemData = {
  $id: ItemId
  $type: string
  $inserted?: boolean
  $mappedId?: ItemId
  [key: string]: any
}


