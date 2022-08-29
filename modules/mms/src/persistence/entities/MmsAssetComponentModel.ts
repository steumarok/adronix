import { CmnMeasurementUnit } from "@adronix/cmn";
import { ColumnNumericTransformer } from "@adronix/typeorm/src";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsChecklistItemModel } from "./MmsChecklistItemModel";

@Entity("mms_asset_component_models")
export class MmsAssetComponentModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => CmnMeasurementUnit)
    measurementUnit: CmnMeasurementUnit;

    @ManyToMany(() => MmsChecklistItemModel)
    @JoinTable({name: "mms_asset_component_models_mms_checklist_item_models"})
    checklistItemModels: MmsChecklistItemModel[];

    @Column({
        type: "decimal",
        default: 1.0,
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer()
    })
    unitQuantity: number;
}
