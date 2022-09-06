import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsStateAttribute } from "./MmsStateAttribute";
import { MmsTask } from "./MmsTask";


@Entity("mms_task_state_changes")
export class MmsTaskStateChange {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    timestamp: Date;

    @ManyToOne(() => MmsTask)
    task: MmsTask;

    @ManyToOne(() => MmsTaskStateChange)
    previous: MmsTaskStateChange;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({ name: "mms_task_state_changes_mms_previous_state_attributes"} )
    previousAttributes: MmsStateAttribute[];

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({ name: "mms_task_state_changes_mms_current_state_attributes"} )
    currentAttributes: MmsStateAttribute[];

}
