import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";
import { MmsTaskModel } from "./MmsTaskModel";

@Entity("mms_tasks")
export class MmsTask {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsAsset)
    asset: MmsAsset;

    @ManyToOne(() => MmsTaskModel)
    model: MmsTaskModel;

    @Column()
    scheduledDate: Date;

    @Column()
    executionDate: Date;

    @Column()
    completeDate: Date;
}
