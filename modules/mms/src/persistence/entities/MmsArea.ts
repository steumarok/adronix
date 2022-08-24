import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAreaModelAttribution } from "./MmsAreaModelAttribution";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_areas")
export class MmsArea {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => MmsClientLocation)
    location: MmsClientLocation;

    @OneToMany(() => MmsAreaModelAttribution, attribution => attribution.area)
    modelAttributions: MmsAreaModelAttribution[];
}
