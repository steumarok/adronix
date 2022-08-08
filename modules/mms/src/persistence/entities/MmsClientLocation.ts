import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsClient } from "./MmsClient";
import { CmnLocality } from "@adronix/cmn";
import { MmsAsset } from "./MmsAsset";

@Entity("mms_client_locations")
export class MmsClientLocation {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    address: string;

    @ManyToOne(() => MmsClient)
    client: MmsClient;

    @ManyToOne(() => CmnLocality)
    locality: CmnLocality;
}
