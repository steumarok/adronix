import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAreaModel } from "./MmsAreaModel";
import { MmsAssetAttribute } from "./MmsAssetAttribute";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsTaskModel } from "./MmsTaskModel";

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

    @ManyToMany(() => MmsTaskModel)
    @JoinTable({name: "mms_schedulings_start_from_lasts"})
    startFromLasts: MmsTaskModel[];

    @ManyToMany(() => MmsAssetModel)
    @JoinTable({name: "mms_schedulings_asset_models"})
    assetModels: MmsAssetModel[];

    @ManyToMany(() => MmsAssetAttribute)
    @JoinTable({name: "mms_schedulings_asset_attributes"})
    assetAttributes: MmsAssetAttribute[];

    @ManyToMany(() => MmsAreaModel)
    @JoinTable({name: "mms_schedulings_area_models"})
    areaModels: MmsAreaModel[];
}
