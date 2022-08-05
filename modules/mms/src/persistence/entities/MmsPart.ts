import { CmnMeasurementUnit } from "@adronix/cmn";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("mms_parts")
export class MmsPart {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({type: "decimal", precision: 10, scale: 4})
    unitPrice: number;

    @ManyToOne(() => CmnMeasurementUnit)
    measurementUnit: CmnMeasurementUnit;
}
