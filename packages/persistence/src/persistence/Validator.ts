import { Errors, ItemError, Rule } from "./types"

export class Validator {
    rules = []

    addRule(expr: () => Promise<{ name: string, error: ItemError } | undefined>): Validator {
        this.rules.push(expr)
        return this
    }

    async validate(): Promise<Errors> {
        const errorMap: Errors = {}

        const results = await Promise.all(this.rules.map(fn => fn()))

        results
            .filter(r => !!r)
            .forEach(r => {
                errorMap[r.name] = (errorMap[r.name] || []).concat([r.error])
            })

        return errorMap
    }
}
