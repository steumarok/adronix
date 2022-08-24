import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAssetAttribute } from "./MmsAssetAttribute";
import { MmsAssetComponentModel } from "./MmsAssetComponentModel";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsPart } from "./MmsPart";
import { MmsTaskModel } from "./MmsTaskModel";

@Entity("mms_part_requirements")
export class MmsPartRequirement {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsTaskModel)
    taskModel: MmsTaskModel;

    @ManyToOne(() => MmsAssetModel)
    assetModel: MmsAssetModel;

    @ManyToOne(() => MmsAssetComponentModel)
    assetComponentModel: MmsAssetComponentModel;

    @ManyToMany(() => MmsAssetAttribute)
    @JoinTable({name: "mms_part_requirements_mms_attributes"})
    assetAttributes: MmsAssetAttribute[];

    @ManyToOne(() => MmsPart)
    part: MmsPart;

    @Column({ type: "decimal", default: 1.0, precision: 10, scale: 4 })
    quantity: Number;

}
