import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsResource } from "./MmsResource";
import { MmsStateAttribute } from "./MmsStateAttribute";
import { MmsTaskModel } from "./MmsTaskModel";
import { MmsWorkOrder } from "./MmsWorkOrder";

@Entity("mms_tasks")
export class MmsTask {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: number;

    @Column()
    codePrefix: string;

    @Column()
    codeSuffix: string;

    @ManyToOne(() => MmsAsset)
    asset: MmsAsset;

    @ManyToOne(() => MmsTaskModel)
    model: MmsTaskModel;

    @Column({ nullable: true })
    scheduledDate: Date;

    @Column({ nullable: true })
    executionDate: Date;

    @Column({ nullable: true })
    completeDate: Date;

    @ManyToMany(() => MmsResource)
    @JoinTable({ name: "mms_tasks_mms_resources" })
    resources: MmsResource[];

    @ManyToOne(() => MmsWorkOrder)
    workOrder: MmsWorkOrder;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_tasks_mms_state_attributes"})
    stateAttributes: MmsStateAttribute[];

}
