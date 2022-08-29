import { EntityClass, EntityProps } from "./types"
import { DateTime } from 'luxon'

export namespace RulePatterns {
    export function base(
        cb: (value: any, entity: any, propName: string, entityClass?: EntityClass<unknown>) => Promise<boolean> | boolean, propName: string, entityClass?: EntityClass<unknown>) {
        return async function(changes: EntityProps, entity: any, name: string, entityClass: EntityClass<unknown>) {
            const _propName = propName || name
            if (entity && changes[_propName] === undefined) {
                return true
            }
            return await cb.call(this, changes[_propName], entity, _propName, entityClass)
        }
    }

    export function notBlank(propName?: string) {
        return base(value => !!value, propName)
    }

    export function matchEnum(e: object, propName?: string) {
        return base(value => Object.values(e).indexOf(value) != -1, propName)
    }

    export function notNull(propName?: string) {
        return base(value => !!value, propName)
    }

    export function minLength(length: number, propName?: string) {
        return base(value => value && value.length >= length, propName)
    }

    export function isDateTime(propName?: string) {
        return base(value => DateTime.fromISO(value).isValid || DateTime.fromJSDate(value).isValid, propName)
    }
}
