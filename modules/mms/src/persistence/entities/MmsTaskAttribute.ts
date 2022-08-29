import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("mms_task_attributes")
export class MmsTaskAttribute {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => MmsTaskAttribute)
    @JoinTable({name: "mms_task_attributes_incompatible"})
    incompatibleAttributes: MmsTaskAttribute[];
}
