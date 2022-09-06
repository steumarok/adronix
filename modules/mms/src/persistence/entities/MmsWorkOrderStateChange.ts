import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsStateAttribute } from "./MmsStateAttribute";
import { MmsTask } from "./MmsTask";
import { MmsTaskStateChange } from "./MmsTaskStateChange";
import { MmsWorkOrder } from "./MmsWorkOrder";


@Entity("mms_work_order_state_changes")
export class MmsWorkOrderStateChange {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    timestamp: Date;

    @ManyToOne(() => MmsWorkOrder)
    workOrder: MmsWorkOrder;

    @ManyToOne(() => MmsWorkOrderStateChange)
    previous: MmsWorkOrderStateChange;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({ name: "mms_work_order_state_changes_mms_previous_state_attributes"} )
    previousAttributes: MmsStateAttribute[];

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({ name: "mms_work_order_state_changes_mms_current_state_attributes"} )
    currentAttributes: MmsStateAttribute[];

    @ManyToMany(() => MmsTaskStateChange)
    @JoinTable({ name: "mms_work_order_state_changes_mms_last_task_state_changes"} )
    lastTaskStateChanges: MmsTaskStateChange[];
}
