import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { MmsStateAttribute } from "./MmsStateAttribute";

export enum MmsTaskCompletionOutcome {
    COMPLETED = 'completed',
    NOT_COMPLETED = 'not_completed',
    PARTIALLY_COMPLETED = 'partially_completed'
}

@Entity("mms_task_closing_reasons")
export class MmsTaskClosingReason {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: MmsTaskCompletionOutcome
    })
    completionOutcome: MmsTaskCompletionOutcome;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({ name: "mms_task_closing_reasons_mms_assigned_attributes"} )
    assignedAttributes: MmsStateAttribute[];

}
