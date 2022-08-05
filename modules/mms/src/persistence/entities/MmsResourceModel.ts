import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAreaModelAttribution } from "./MmsAreaModelAttribution";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";
import { MmsResourceType } from "./MmsResourceType";

@Entity("mms_resource_models")
export class MmsResourceModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => MmsResourceType)
    resourceType: MmsResourceType;
}
