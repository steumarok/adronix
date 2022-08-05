import { CmnMeasurementUnit } from "modules/cmn/src";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAreaModelAttribution } from "./MmsAreaModelAttribution";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_services")
export class MmsService {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => CmnMeasurementUnit)
    measurementUnit: CmnMeasurementUnit;

}
