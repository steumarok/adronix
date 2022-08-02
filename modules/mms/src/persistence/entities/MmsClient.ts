import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("mms_clients")
export class MmsClient {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

}
