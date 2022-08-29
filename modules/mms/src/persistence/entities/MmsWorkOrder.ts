import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_work_orders")
export class MmsWorkOrder {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @ManyToOne(() => MmsClient)
    client: MmsClient;

    @ManyToOne(() => MmsClientLocation)
    location: MmsClientLocation;

    @Column({ name: "insert_date"} )
    insertDate: Date;

    @Column({ name: "complete_date", nullable: true })
    completeDate: Date;
}
