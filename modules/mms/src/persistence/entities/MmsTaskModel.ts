import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsResourceModel } from "./MmsResourceModel";

@Entity("mms_task_models")
export class MmsTaskModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    codePrefix: string;

    @Column({ nullable: true })
    codeSuffix: string;

    @Column({ default: true })
    useGlobalCounter: boolean;

    @ManyToMany(() => MmsResourceModel)
    @JoinTable()
    resourceModels: MmsResourceModel[];
}
