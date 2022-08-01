import { ItemProp, ServerErrors } from "./types"

export class Item {
    constructor(type: string, id: string) {
      this.type = type
      this.id = id
    }
    [key: string]: ItemProp
    id: string
    type: string
    changes: Set<string> = new Set()
    inserted: boolean = false
    deleted: boolean = false
    errors: ServerErrors = {}
}