import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsDayType } from "./MmsDayType";

@Entity("mms_calendars")
export class MmsCalendar {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => MmsCalendar)
    parent: MmsCalendar;

    @ManyToOne(() => MmsDayType)
    mondayType: MmsDayType;

    @ManyToOne(() => MmsDayType)
    tuesdayType: MmsDayType;

    @ManyToOne(() => MmsDayType)
    wednesdayType: MmsDayType;

    @ManyToOne(() => MmsDayType)
    thursdayType: MmsDayType;

    @ManyToOne(() => MmsDayType)
    fridayType: MmsDayType;

    @ManyToOne(() => MmsDayType)
    saturdayType: MmsDayType;

    @ManyToOne(() => MmsDayType)
    sundayType: MmsDayType;

}
