import { AbstractService, InjectService, IOService, Utils } from "@adronix/server";
import { InjectTypeORM, TypeORM } from "@adronix/typeorm";
import { DateTime } from "luxon";
import { MmsArea } from "../persistence/entities/MmsArea";
import { MmsAreaModelAttribution } from "../persistence/entities/MmsAreaModelAttribution";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetComponent } from "../persistence/entities/MmsAssetComponent";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsAssetModelPivot } from "../persistence/entities/MmsAssetModelPivot";
import { MmsChecklist } from "../persistence/entities/MmsChecklist";
import { MmsChecklistItem } from "../persistence/entities/MmsChecklistItem";
import { MmsChecklistItemOption } from "../persistence/entities/MmsChecklistItemOption";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";


export type TaskModelDate = {
    taskModel: MmsTaskModel,
    date: DateTime
}

export class MmsAssetService extends AbstractService {

    @InjectService
    io: IOService

    @InjectTypeORM
    typeorm: TypeORM

    *findLocation(location: MmsClientLocation) {
        return yield this.typeorm.findOne(MmsClientLocation, {
            where: { id: location.id },
            relations: { client: true }
        })
    }

    *createCompositeAsset(location: MmsClientLocation, model: MmsAssetModel) {

        const loc: MmsClientLocation = yield* this.findLocation(location)

        const asset = yield this.io.throwing.insert(MmsAsset, {
            location,
            model,
            name: 'Sede',
            client: loc.client
        })

        const pivots: MmsAssetModelPivot[] = yield this.typeorm.find(MmsAssetModelPivot, {
            where: { assetModel: { id: model.id } },
            relations: { areaModel: true, componentModel: true }
        })

        const groups = Utils.groupBy(pivots, item => item.rowGroup)
        const counters = new Map<number, number>()

        for (const [ rowGroup, pivots ] of groups) {
            const area = yield this.io.throwing.insert(MmsArea, {
                name: pivots[0].areaModel.name,
                location: loc
            })
            const modelAttribution = yield this.io.throwing.insert(MmsAreaModelAttribution, {
                area,
                model: pivots[0].areaModel
            })
            for (const pivot of pivots) {
                for (var i = 0; i < pivot.quantity; i++) {

                    const index = counters.get(pivot.componentModel.id) || 1
                    counters.set(pivot.componentModel.id, index + 1)

                    const name = `${pivot.componentModel.name} #${index}`

                    yield this.io.throwing.insert(MmsAssetComponent, {
                        quantity: 1,
                        name,
                        asset,
                        model: pivot.componentModel,
                        area
                    })
                }
            }
        }

        return asset
    }

    *triggerChecklistItemStateChange(checklistItem: MmsChecklistItem) {

        const option: MmsChecklistItemOption = yield this.typeorm.findOne(MmsChecklistItemOption, {
            where: { id: checklistItem.option.id },
            relations: {
                stateAttributes: true
            }
        })

        checklistItem = yield this.typeorm.findOne(MmsChecklistItem, {
            where: { id: checklistItem.id },
            relations: {
                checklist: {
                    asset: {
                        stateAttributes: true
                    },
                    assignedStateAttributes: true
                },
                assetComponent: true
            }
        })

        const { checklist } = checklistItem
        const { asset } = checklist

        yield this.io.throwing.update(MmsAsset, asset, {
            stateAttributes: Utils.distinct([
                ...asset.stateAttributes,
                ...option.stateAttributes.filter(a => a.forAsset)
            ], 'id')
        })

        const { assetComponent } = checklistItem

        if (assetComponent) {
            yield this.io.throwing.update(MmsAssetComponent, assetComponent, {
                stateAttributes: Utils.distinct([
                    ...asset.stateAttributes,
                    ...option.stateAttributes.filter(a => a.forAssetComponent)
                ], 'id')
            })
        }

        yield this.io.throwing.update(MmsChecklist, checklistItem.checklist, {
            assignedStateAttributes: Utils.distinct([
                ...checklist.assignedStateAttributes,
                ...option.stateAttributes
            ], 'id')
        })
    }

    *getLastChecklist(asset: MmsAsset) {
        return yield this.typeorm.findOne(MmsChecklist, {
            where: {
                asset: { id: asset.id },
            },
            order: {
                id: "desc"
            }
        })
    }
}

