import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAreaModelAttribution } from "./MmsAreaModelAttribution";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_resource_types")
export class MmsResourceType {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

}
