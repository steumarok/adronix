import { CmnMeasurementUnit } from "@adronix/cmn";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_asset_component_models")
export class MmsAssetComponentModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => CmnMeasurementUnit)
    measurementUnit: CmnMeasurementUnit;

}
