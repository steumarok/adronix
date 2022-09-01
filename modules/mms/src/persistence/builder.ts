import { EntityEventKind, EntityIODefinitions, RulePatterns } from "@adronix/persistence";
import { IOService } from "@adronix/server/src";
import { TypeORMPersistence, TypeORMTransaction } from "@adronix/typeorm";
import { DateTime } from "luxon";
import { MmsAssetService } from "../services/MmsAssetService";
import { MmsTaskService } from "../services/MmsTaskService";
import { MmsArea } from "./entities/MmsArea";
import { MmsAreaModel } from "./entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "./entities/MmsAreaModelAttribution";
import { MmsAsset } from "./entities/MmsAsset";
import { MmsAssetAttribute } from "./entities/MmsAssetAttribute";
import { MmsAssetComponent } from "./entities/MmsAssetComponent";
import { MmsAssetComponentModel } from "./entities/MmsAssetComponentModel";
import { MmsAssetModel } from "./entities/MmsAssetModel";
import { MmsAssetModelPivot } from "./entities/MmsAssetModelPivot";
import { MmsChecklist } from "./entities/MmsChecklist";
import { MmsChecklistItem } from "./entities/MmsChecklistItem";
import { MmsChecklistItemModel, MmsChecklistItemType } from "./entities/MmsChecklistItemModel";
import { MmsChecklistItemOption } from "./entities/MmsChecklistItemOption";
import { MmsChecklistModel } from "./entities/MmsChecklistModel";
import { MmsClient } from "./entities/MmsClient";
import { MmsClientLocation } from "./entities/MmsClientLocation";
import { MmsCounter } from "./entities/MmsCounter";
import { MmsLastTaskInfo } from "./entities/MmsLastTaskInfo";
import { MmsPart } from "./entities/MmsPart";
import { MmsPartRequirement } from "./entities/MmsPartRequirement";
import { MmsResource } from "./entities/MmsResource";
import { MmsResourceModel } from "./entities/MmsResourceModel";
import { MmsResourceType } from "./entities/MmsResourceType";
import { MmsScheduling } from "./entities/MmsScheduling";
import { MmsService } from "./entities/MmsService";
import { MmsServiceProvision } from "./entities/MmsServiceProvision";
import { MmsStateAttribute } from "./entities/MmsStateAttribute";
import { MmsTask } from "./entities/MmsTask";
import { MmsTaskClosingReason } from "./entities/MmsTaskClosingReason";
import { MmsTaskModel } from "./entities/MmsTaskModel";
import { MmsWorkOrder } from "./entities/MmsWorkOrder";
import { MmsWorkPlan } from "./entities/MmsWorkPlan";

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
        entityClass: MmsTask,
        rules: {
            'scheduledDate':   [ [ RulePatterns.isDateTime(), 'notValid' ] ]
        }
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
    {
        entityClass: MmsResource
    },
    {
        entityClass: MmsWorkOrder
    },
    {
        entityClass: MmsChecklistModel
    },
    {
        entityClass: MmsChecklistItemOption
    },
    {
        entityClass: MmsChecklist
    },
    {
        entityClass: MmsChecklistItem
    },
    {
        entityClass: MmsStateAttribute
    },
    {
        entityClass: MmsTaskClosingReason
    },
    {
        entityClass: MmsChecklistItemModel,
        rules: {
            'text':     [ [ RulePatterns.notBlank(), 'blank' ] ],
            'dataType': [
                [ RulePatterns.notBlank(), 'blank' ],
                [ RulePatterns.matchEnum(MmsChecklistItemType), 'notValid' ]
            ]
        }
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
        if (eventKind == EntityEventKind.Updating) {
            await transaction.saga(this.service(MmsTaskService).triggerTaskStateChange(task))
        }
        else if (eventKind == EntityEventKind.Updated) {
            await transaction.saga(this.service(MmsTaskService).checkWorkOrderState({ task }))
        }
        else if (eventKind == EntityEventKind.Deleting) {
            const serviceProvisions = await transaction.entityManager.find(MmsServiceProvision, {
                where: { task: { id: task.id } }
            })
            for (const serviceProvision of serviceProvisions) {
                await this.service(IOService).throwing.delete(MmsServiceProvision, serviceProvision)(transaction)
            }
        }
    })
    .addEventHandler(MmsWorkOrder, async function(eventKind: EntityEventKind, workOrder: MmsWorkOrder, transaction: TypeORMTransaction) {
        if (eventKind == EntityEventKind.Inserting) {
            workOrder.code = await transaction.saga(this.service(MmsTaskService).generateWorkOrderCode())
            workOrder.insertDate = DateTime.now().toJSDate()
        }
    })
    .addEventHandler(MmsChecklistItem, async function(eventKind: EntityEventKind, checklistItem: MmsChecklistItem, transaction: TypeORMTransaction) {
        if (eventKind == EntityEventKind.Inserting || eventKind == EntityEventKind.Updating) {
            checklistItem.value = checklistItem.option.value

            await transaction.saga(this.service(MmsAssetService).triggerChecklistItemStateChange(checklistItem))
        }
    })
    .addEventHandler(MmsChecklist, async function(eventKind: EntityEventKind, checklist: MmsChecklist, transaction: TypeORMTransaction) {
        if (eventKind == EntityEventKind.Inserting) {
            checklist.previous = await transaction.saga(this.service(MmsAssetService).getLastChecklist(checklist.asset))
        }
    })
    .addEventHandler(MmsWorkOrder, async function(eventKind: EntityEventKind, workOrder: MmsWorkOrder, transaction: TypeORMTransaction) {
        if (eventKind == EntityEventKind.Inserting) {
            workOrder.stateAttributes = await transaction.saga(this.service(MmsTaskService)
                .getInitialAttributes({ forWorkOrder: true }))
        }
    })
    ;

