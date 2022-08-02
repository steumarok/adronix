import { MmsClient } from "./entities/MmsClient";
import { EntityIODefinitions, RulePatterns } from "@adronix/persistence"
import { TypeORMPersistence, TypeORMRulePatterns } from "@adronix/typeorm";
import { MmsClientLocation } from "./entities/MmsClientLocation";
import { MmsArea } from "./entities/MmsArea";

const ioDefinitions: EntityIODefinitions = [
    {
        entityClass: MmsClient,
        rules: {
            'name': [
                [ RulePatterns.notBlank(),   'empty']
            ]
        }
    },
    {
        entityClass: MmsClientLocation
    }
    ,
    {
        entityClass: MmsArea
    }
]


export default TypeORMPersistence.build()
    .addDefinitions(ioDefinitions);

