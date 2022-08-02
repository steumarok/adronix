import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("cmn_localities")
export class CmnLocality {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

}
