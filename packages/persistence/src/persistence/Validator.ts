import { AsyncRule, Errors, ItemError, Rule } from "./types"

export class Validator {
    rules: Map<string, Rule[]> = new Map()
    asyncRules: Map<string, AsyncRule[]> = new Map()

    addRule(name: string, expr: () => boolean, error: ItemError): Validator {
        this.rules.set(name, [{ expr, error }, ...this.rules.get(name) || []])
        return this
    }

    addAsyncRule(name: string, expr: () => Promise<boolean>, error: ItemError): Validator {
        this.asyncRules.set(name, [{ expr, error }, ...this.asyncRules.get(name) || []])
        return this
    }

    async validate(): Promise<Errors> {
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

        const r = []
        Array.from(this.asyncRules.entries()).map(value => {
            value[1].forEach(rule => {
                r.push({
                    rule,
                    name: value[0]
                })
            })
        })

        const results = await Promise.all(
            r.map(async a => ({
                result: await a.rule.expr(),
                rule: a.rule,
                name: a.name
            }))
        )

        results.forEach(({result, rule, name}) => {
            if (!result) {
                if (!errorMap[name]) {
                    errorMap[name] = []
                }
                errorMap[name].push(rule.error)
            }
        })

        return errorMap
    }
}
