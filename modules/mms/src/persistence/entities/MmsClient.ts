import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_clients")
export class MmsClient {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => MmsClientLocation, location => location.client)
    locations: MmsClientLocation[];

}
