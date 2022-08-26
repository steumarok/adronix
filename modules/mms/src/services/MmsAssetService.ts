import { AbstractService, InjectService, IOService, Utils } from "@adronix/server";
import { InjectDataSource, InjectTypeORM, TypeORM, TypeORMTransaction } from "@adronix/typeorm";
import { DateTime } from "luxon";
import { MmsArea } from "../persistence/entities/MmsArea";
import { MmsAreaModelAttribution } from "../persistence/entities/MmsAreaModelAttribution";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetComponent } from "../persistence/entities/MmsAssetComponent";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsAssetModelPivot } from "../persistence/entities/MmsAssetModelPivot";
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
            where: { assetModel: model },
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
}

