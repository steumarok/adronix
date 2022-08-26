import { CmnMeasurementUnit } from "@adronix/cmn";
import { ColumnNumericTransformer } from "@adronix/typeorm/src";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { MmsAssetComponent } from "./MmsAssetComponent";
import { MmsService } from "./MmsService";
import { MmsTask } from "./MmsTask";
import { MmsWorkPlan } from "./MmsWorkPlan";

@Entity("mms_service_provisions")
export class MmsServiceProvision {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsTask)
    task: MmsTask;

    @ManyToOne(() => MmsService)
    service: MmsService;

    @ManyToOne(() => MmsWorkPlan)
    workPlan: MmsWorkPlan;

    @ManyToMany(() => MmsAssetComponent)
    @JoinTable({name: "mms_service_provisions_mms_asset_components"})
    assetComponents: MmsAssetComponent[];

    @Column({
        type: "decimal",
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer()
    })
    expectedQuantity: Number;
}
