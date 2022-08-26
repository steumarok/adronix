import { ColumnNumericTransformer } from "@adronix/typeorm/src";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAssetAttribute } from "./MmsAssetAttribute";
import { MmsAssetComponentModel } from "./MmsAssetComponentModel";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsQuantityType } from "./MmsPartRequirement";
import { MmsService } from "./MmsService";
import { MmsTaskModel } from "./MmsTaskModel";


@Entity("mms_work_plans")
export class MmsWorkPlan {

    constructor(props: Partial<{ [Property in keyof MmsWorkPlan]: any }> = {}) {
        Object.assign(this, props)
    }

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsTaskModel)
    taskModel: MmsTaskModel;

    @ManyToMany(() => MmsAssetAttribute)
    @JoinTable({ name: "mms_work_plans_mms_asset_attributes" })
    assetAttributes: MmsAssetAttribute[];

    @ManyToOne(() => MmsAssetComponentModel)
    assetComponentModel: MmsAssetComponentModel;

    @ManyToOne(() => MmsAssetModel)
    assetModel: MmsAssetModel;

    @ManyToOne(() => MmsService)
    service: MmsService;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer()
    })
    quantity: number;

    @Column({
        type: 'enum',
        enum: MmsQuantityType,
        default: MmsQuantityType.RELATIVE
    })
    quantityType: MmsQuantityType;

}
