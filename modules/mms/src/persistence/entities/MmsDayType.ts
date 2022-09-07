import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MmsAreaModelAttribution } from "./MmsAreaModelAttribution";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_day_types")
export class MmsDayType {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
