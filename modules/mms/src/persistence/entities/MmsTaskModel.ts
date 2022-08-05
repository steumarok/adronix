import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsResourceModel } from "./MmsResourceModel";

@Entity("mms_task_models")
export class MmsTaskModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => MmsResourceModel)
    @JoinTable()
    resourceModels: MmsResourceModel[];
}
