import { RulePatterns } from "@adronix/persistence/src"
import { Not } from "typeorm"
import { TypeORMContext } from "./TypeORMContext"

export namespace TypeORMRulePatterns {
    export function checkDup(propName?: string) {
        return RulePatterns.base(async function (value, entity, propName, entityClass) {
            const conditions = entity ? { id: Not(entity.id) } : {}
            const count = await (this as TypeORMContext).dataSource.getRepository(entityClass)
                .count({ where: { [propName]: value, ...conditions }})
            return count == 0
        }, propName)
    }

}