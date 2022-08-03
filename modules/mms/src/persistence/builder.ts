import { MmsClient } from "./entities/MmsClient";
import { EntityIODefinitions, RulePatterns } from "@adronix/persistence"
import { TypeORMPersistence, TypeORMRulePatterns } from "@adronix/typeorm";
import { MmsClientLocation } from "./entities/MmsClientLocation";
import { MmsArea } from "./entities/MmsArea";
import { MmsAreaModel } from "./entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "./entities/MmsAreaModelAttribution";

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
    },
    {
        entityClass: MmsArea
    },
    {
        entityClass: MmsAreaModel
    },
    {
        entityClass: MmsAreaModelAttribution
    }
]


export default TypeORMPersistence.build()
    .addDefinitions(ioDefinitions);

