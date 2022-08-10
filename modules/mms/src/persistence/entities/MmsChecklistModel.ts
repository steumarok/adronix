import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("mms_checklist_models")
export class MmsChecklistModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
