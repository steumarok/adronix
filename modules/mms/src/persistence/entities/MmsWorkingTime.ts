import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsDayType } from "./MmsDayType";

@Entity("mms_working_times")
export class MmsWorkingTime {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "time" })
    start: string;

    @Column({ type: "time" })
    finish: string;

    @ManyToOne(() => MmsDayType)
    dayType: MmsDayType;
}
