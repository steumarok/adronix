import { IamUser } from "./entities";
import { EntityIODefinitions, RulePatterns } from "@adronix/persistence"
import { TypeORMPersistence, TypeORMRulePatterns } from "@adronix/typeorm";

const ioDefinitions: EntityIODefinitions = [
    {
        entityClass: IamUser,
        rules: {
            'username': [
                [ RulePatterns.notBlank(),   'empty'],
                [ RulePatterns.minLength(3), 'min length 3' ],
                [ TypeORMRulePatterns.checkDup(),
                    { message: 'duplicated username' } ]
            ]
        }
    }
]


export default TypeORMPersistence.build()
    .addDefinitions(ioDefinitions);

