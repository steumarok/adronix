import { CmnMeasurementUnit } from "@adronix/cmn";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsChecklistModel } from "./MmsChecklistModel";

export enum MmsAssetType {
    SIMPLE = 'simple',
    COMPOSITE = 'composite'
}

@Entity("mms_asset_models")
export class MmsAssetModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: MmsAssetType,
        default: MmsAssetType.SIMPLE
    })
    assetType: MmsAssetType;

    @ManyToOne(() => MmsChecklistModel)
    checklistModel: MmsChecklistModel;

    @ManyToOne(() => CmnMeasurementUnit)
    measurementUnit: CmnMeasurementUnit;
}
