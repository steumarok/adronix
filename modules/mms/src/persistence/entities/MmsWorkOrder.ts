import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";
import { MmsStateAttribute } from "./MmsStateAttribute";

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

    @Column()
    insertDate: Date;

    @Column({ nullable: true })
    completeDate: Date;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_work_orders_mms_state_attributes"})
    stateAttributes: MmsStateAttribute[];
}
