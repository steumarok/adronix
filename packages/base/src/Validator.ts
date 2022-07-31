export type Error = string | {
    code?: string,
    message: string
}
export type Errors = {
    [key: string]: Error[] | Error
}

type RuleExpr = () => Promise<{ name: string, error: Error } | undefined>

export class Validator {
    rules: RuleExpr[] = []

    addRule(expr: RuleExpr): Validator {
        this.rules.push(expr)
        return this
    }

    async validate(): Promise<Errors> {
        const errorMap: { [key: string]: Error[] } = {}

        const results = await Promise.all(this.rules.map(fn => fn()))

        results
            .filter(r => !!r)
            .forEach(r => {
                if (r) {
                    errorMap[r.name] = (errorMap[r.name] || []).concat(Validator.normalizeError(r.error))
                }
            })

        return errorMap
    }

    static normalize(errors: Errors) {
        const errorMap: { [key: string]: Error[] } = {}

        Array.from(Object.entries(errors)).forEach(value => {
            errorMap[value[0]] = Validator.normalizeError(value[1])
        })

        return errorMap
    }

    protected static normalizeError(error: Error[] | Error): Error[] {
        if (Array.isArray(error)) {
            return error.map(e => Validator.transformError(e))
        }
        else {
            return [Validator.transformError(error)]
        }
    }

    protected static transformError(error: Error): Error {
        if (typeof error === "string") {
            return {
                message: error
            }
        }
        else {
            return error
        }
    }
}
