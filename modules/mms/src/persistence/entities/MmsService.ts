import { CmnMeasurementUnit } from "@adronix/cmn";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne } from "typeorm";

@Entity("mms_services")
export class MmsService {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => CmnMeasurementUnit)
    measurementUnit: CmnMeasurementUnit;

    @Column({ type: "decimal", precision: 10, scale: 4 })
    price: Number;
}
