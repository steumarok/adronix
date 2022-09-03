import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsAreaModel } from "./MmsAreaModel";
import { MmsAssetAttribute } from "./MmsAssetAttribute";
import { MmsAssetComponentModel } from "./MmsAssetComponentModel";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsStateAttribute } from "./MmsStateAttribute";
import { MmsTaskModel } from "./MmsTaskModel";

export enum MmsDayOfWeek {
    MON = 'mon',
    TUE = 'tue',
    WED = 'wed',
    THU = 'thu',
    FRI = 'fri',
    SAT = 'sat',
    SUN = 'sun',
}

@Entity("mms_schedulings")
export class MmsScheduling {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsTaskModel)
    taskModel: MmsTaskModel;

    @Column()
    every: number;

    @Column()
    unit: string;

    @Column({nullable: true})
    dayMonthFrom: string;

    @Column({nullable: true})
    dayMonthTo: string;

    @Column({nullable: true})
    startTime: string;

    @ManyToMany(() => MmsTaskModel)
    @JoinTable({ name: "mms_schedulings_start_from_lasts" })
    startFromLasts: MmsTaskModel[];

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({ name: "mms_schedulings_mms_lasts_state_attributes"} )
    lastsStateAttributes: MmsStateAttribute[];

    @Column({nullable: true})
    startImmediately: boolean;

    @ManyToMany(() => MmsAssetModel)
    @JoinTable({ name: "mms_schedulings_asset_models" })
    assetModels: MmsAssetModel[];

    @ManyToMany(() => MmsAssetAttribute)
    @JoinTable({ name: "mms_schedulings_asset_attributes" })
    assetAttributes: MmsAssetAttribute[];

    @ManyToMany(() => MmsAreaModel)
    @JoinTable({name: "mms_schedulings_area_models"})
    areaModels: MmsAreaModel[];

    @ManyToMany(() => MmsAssetComponentModel)
    @JoinTable({ name: "mms_schedulings_asset_component_models" })
    assetComponentModels: MmsAssetComponentModel[];

    @Column({
        type: 'set',
        enum: MmsDayOfWeek,
        nullable: true
    })
    daysOfWeek: MmsDayOfWeek[];

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({ name: "mms_schedulings_mms_assigned_attributes"} )
    assignedAttributes: MmsStateAttribute[];

    @Column({nullable: true})
    maxTaskCount: number;

    @Column()
    maxPeriod: number;

    @Column()
    maxPeriodUnit: string;
}
