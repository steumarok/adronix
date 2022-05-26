import { Errors, ItemError, Rule } from "./types"

export class Validator {
    rules: Map<string, Rule[]> = new Map()

    addRule(name: string, expr: () => boolean, error: ItemError): Validator {
        this.rules.set(name, [{ expr, error }, ...this.rules.get(name) || []])
        return this
    }

    validate(): Errors {
        const errorMap: Errors = {}
        this.rules.forEach((value, key) => {
            const errors = []
            value.filter(r => !r.expr()).forEach(rule => {
                errors.push(rule.error)
            })
            if (errors.length > 0) {
                errorMap[key] = errors
            }
        })
        return errorMap
    }
}
