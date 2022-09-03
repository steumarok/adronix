import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsResource } from "./MmsResource";
import { MmsScheduling } from "./MmsScheduling";
import { MmsStateAttribute } from "./MmsStateAttribute";
import { MmsTaskClosingReason, MmsTaskCompletionOutcome } from "./MmsTaskClosingReason";
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

    @ManyToOne(() => MmsScheduling)
    scheduling: MmsScheduling;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_tasks_mms_state_attributes"})
    stateAttributes: MmsStateAttribute[];

    @Column({
        type: 'enum',
        enum: MmsTaskCompletionOutcome,
        nullable: true
    })
    completionOutcome: MmsTaskCompletionOutcome;

    @ManyToOne(() => MmsTaskClosingReason, { nullable: true })
    closingReason: MmsTaskClosingReason;

    @Column({ length: 4096, nullable: true })
    completionNotes: string;
}
