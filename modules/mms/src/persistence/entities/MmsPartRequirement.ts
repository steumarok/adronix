import { ColumnNumericTransformer } from "@adronix/typeorm/src";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAssetAttribute } from "./MmsAssetAttribute";
import { MmsAssetComponentModel } from "./MmsAssetComponentModel";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsPart } from "./MmsPart";
import { MmsTask } from "./MmsTask";
import { MmsTaskModel } from "./MmsTaskModel";

export enum MmsQuantityType {
    RELATIVE = 'relative',
    ABSOLUTE = 'absolute'
}

@Entity("mms_part_requirements")
export class MmsPartRequirement {

    constructor(props: Partial<{ [Property in keyof MmsPartRequirement]: any }> = {}) {
        Object.assign(this, props)
    }

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsTaskModel)
    taskModel: MmsTaskModel;

    @ManyToMany(() => MmsAssetAttribute)
    @JoinTable({ name: "mms_part_requirements_mms_asset_attributes" })
    assetAttributes: MmsAssetAttribute[];

    @ManyToOne(() => MmsAssetComponentModel)
    assetComponentModel: MmsAssetComponentModel;

    @ManyToOne(() => MmsAssetModel)
    assetModel: MmsAssetModel;

    @ManyToOne(() => MmsPart)
    part: MmsPart;

    @Column({
        type: "decimal",
        default: 1.0,
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer()
    })
    quantity: Number;

    @Column({
        type: 'enum',
        enum: MmsQuantityType,
        default: MmsQuantityType.RELATIVE
    })
    quantityType: MmsQuantityType;

}
