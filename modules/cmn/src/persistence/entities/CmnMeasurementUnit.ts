import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("cmn_measurement_units")
export class CmnMeasurementUnit {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

}
