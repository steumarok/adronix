import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_area_models")
export class MmsAreaModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

}
