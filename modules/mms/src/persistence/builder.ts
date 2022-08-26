import { MmsClient } from "./entities/MmsClient";
import { EntityEventKind, EntityIODefinitions, RulePatterns, Transaction } from "@adronix/persistence"
import { TypeORMPersistence, TypeORMRulePatterns, TypeORMTransaction } from "@adronix/typeorm";
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
import { MmsAssetModelPivot } from "./entities/MmsAssetModelPivot";
import { MmsAssetComponentModel } from "./entities/MmsAssetComponentModel";
import { MmsAssetComponent } from "./entities/MmsAssetComponent";
import { IOService } from "@adronix/server/src";
import { MmsTask } from "./entities/MmsTask";
import { MmsCounter } from "./entities/MmsCounter";
import { MmsWorkPlan } from "./entities/MmsWorkPlan";
import { MmsService } from "./entities/MmsService";
import { MmsServiceProvision } from "./entities/MmsServiceProvision";

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
    {
        entityClass: MmsAssetModelPivot
    },
    {
        entityClass: MmsAssetComponentModel
    },
    {
        entityClass: MmsAssetComponent
    },
    {
        entityClass: MmsTask
    },
    {
        entityClass: MmsService
    },
    {
        entityClass: MmsServiceProvision
    },
    {
        entityClass: MmsWorkPlan
    },
    {
        entityClass: MmsCounter
    },
]


export default TypeORMPersistence.build()
    .addDefinitions(ioDefinitions)
    .addEventHandler(MmsAsset, async function(eventKind: EntityEventKind, asset: MmsAsset, transaction: TypeORMTransaction) {
        if (eventKind == EntityEventKind.Deleting) {
            const components = await transaction.entityManager.find(MmsAssetComponent, {
                where: { asset: { id: asset.id } }
            })
            for (const component of components) {
                await this.service(IOService).throwing.delete(MmsAssetComponent, component)(transaction)
            }
        }
    })
    .addEventHandler(MmsTask, async function(eventKind: EntityEventKind, task: MmsTask, transaction: TypeORMTransaction) {
        if (eventKind == EntityEventKind.Deleting) {
            const serviceProvisions = await transaction.entityManager.find(MmsServiceProvision, {
                where: { task: { id: task.id } }
            })
            for (const serviceProvision of serviceProvisions) {
                await this.service(IOService).throwing.delete(MmsServiceProvision, serviceProvision)(transaction)
            }
        }
    });

