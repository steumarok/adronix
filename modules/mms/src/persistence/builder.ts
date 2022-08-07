import { MmsClient } from "./entities/MmsClient";
import { EntityIODefinitions, RulePatterns } from "@adronix/persistence"
import { TypeORMPersistence, TypeORMRulePatterns } from "@adronix/typeorm";
import { MmsClientLocation } from "./entities/MmsClientLocation";
import { MmsArea } from "./entities/MmsArea";
import { MmsAreaModel } from "./entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "./entities/MmsAreaModelAttribution";
import { MmsAsset } from "./entities/MmsAsset";
import { MmsAssetModel } from "./entities/MmsAssetModel";
import { MmsResourceModel } from "./entities/MmsResourceModel";
import { MmsResourceType } from "./entities/MmsResourceType";
import { MmsPart } from "./entities/MmsPart";
import { MmsTaskModel } from "./entities/MmsTaskModel";
import { MmsPartRequirement } from "./entities/MmsPartRequirement";
import { MmsAssetAttribute } from "./entities/MmsAssetAttribute";
import { MmsLastTaskInfo } from "./entities/MmsLastTaskInfo";
import { MmsScheduling } from "./entities/MmsScheduling";

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
    },
    {
        entityClass: MmsAsset,
        rules: {
            'client':   [ [ RulePatterns.notNull(), 'empty' ] ],
            'location': [ [ RulePatterns.notNull(), 'empty' ] ]
        }
    },
    {
        entityClass: MmsAssetModel
    },
    {
        entityClass: MmsAssetAttribute
    },
    {
        entityClass: MmsResourceModel
    },
    {
        entityClass: MmsResourceType
    },
    {
        entityClass: MmsPart
    },
    {
        entityClass: MmsTaskModel
    },
    {
        entityClass: MmsPartRequirement
    },
    {
        entityClass: MmsLastTaskInfo
    },
    {
        entityClass: MmsScheduling
    },
]


export default TypeORMPersistence.build()
    .addDefinitions(ioDefinitions);

