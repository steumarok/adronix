import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAssetAttribute } from "./MmsAssetAttribute";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";
import { MmsService } from "./MmsService";
import { MmsTaskModel } from "./MmsTaskModel";

@Entity("mms_work_plans")
export class MmsWorkPlan {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsTaskModel)
    taskModel: MmsTaskModel;

    @ManyToOne(() => MmsAssetModel)
    assetModel: MmsAssetModel;

    @ManyToMany(() => MmsAssetAttribute)
    @JoinTable({name: "mms_work_plans_mms_attributes"})
    attributes: MmsAssetAttribute[];

    @ManyToOne(() => MmsService)
    service: MmsService;

    @Column()
    duration: Number;

}
