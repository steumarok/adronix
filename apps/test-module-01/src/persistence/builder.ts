import { TcmProductOptionValue, TcmProductOption, TcmIngredient, TcmShop } from "./entities";
import { AsyncRuleExpr, EntityIODefinitions, RulePatterns } from "@adronix/persistence"
import { TypeORMContext, TypeORMPersistence } from "@adronix/typeorm";
import { Not } from "typeorm";

export { TcmIngredient, TcmProductOption, TcmProductOptionValue, TcmShop }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue, TcmShop ]



const checkNameDup: AsyncRuleExpr = async function({ name }, entity: TcmProductOption) {
    const conditions = entity ? { id: Not(entity.id) } : {}
    const po = await (this as TypeORMContext).dataSource.getRepository(TcmProductOption)
        .findOne({ where: { name, ...conditions }})
    return !po
}


const ioDefinitions: EntityIODefinitions = [
    {
        entityClass: TcmProductOption,
        rules: {
            'name': [
                [ RulePatterns.notBlank(),   'empty'],
                [ RulePatterns.minLength(3), 'min length 3' ],
                [ checkNameDup,              { code: 'CHK001', message: 'name not valid' } ]
            ]
        }
    },
    {
        entityClass: TcmIngredient
    },
    {
        entityClass: TcmShop
    }
]


export const persistenceBuilder = TypeORMPersistence.build()
    .addDefinitions(ioDefinitions);

