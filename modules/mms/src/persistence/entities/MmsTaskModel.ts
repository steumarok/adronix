import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("mms_task_models")
export class MmsTaskModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
