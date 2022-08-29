import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsResourceModel } from "./MmsResourceModel";

@Entity("mms_resources")
export class MmsResource {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => MmsResourceModel)
    @JoinTable({ name: "mms_resources_mms_resource_models" })
    models: MmsResourceModel[];
}
