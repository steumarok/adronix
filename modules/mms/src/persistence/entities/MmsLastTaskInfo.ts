import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsTask } from "./MmsTask";
import { MmsTaskModel } from "./MmsTaskModel";

@Entity("mms_last_task_infos")
export class MmsLastTaskInfo {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsAsset)
    asset: MmsAsset;

    @ManyToOne(() => MmsTaskModel)
    taskModel: MmsTaskModel;

    @Column({type: "date"})
    executionDate: Date;

    @ManyToOne(() => MmsTask)
    task: MmsTask;
}
