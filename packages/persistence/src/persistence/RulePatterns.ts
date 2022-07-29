import { EntityProps } from "./types"

export class RulePatterns {
    static base(cb: (value: any) => boolean, propName: string) {
        return function(changes: EntityProps, entity: any, name: string) {
            const _propName = propName || name
            if (entity && changes[_propName] === undefined) {
                return true
            }
            return cb(changes[_propName])
        }
    }

    static notBlank(propName?: string) {
        return RulePatterns.base(value => !!value, propName)
    }

    static minLength(length: number, propName?: string) {
        return RulePatterns.base(value => value.length >= length, propName)
    }
}
