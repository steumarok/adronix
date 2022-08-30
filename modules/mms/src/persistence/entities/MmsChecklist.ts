import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsAssetComponent } from "./MmsAssetComponent";
import { MmsChecklistModel } from "./MmsChecklistModel";
import { MmsStateAttribute } from "./MmsStateAttribute";
import { MmsWorkOrder } from "./MmsWorkOrder";

@Entity("mms_checklists")
export class MmsChecklist {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsChecklist, { nullable: true })
    previous: MmsChecklist;

    @ManyToOne(() => MmsChecklistModel)
    model: MmsChecklistModel;

    @Column({ type: "datetime" })
    compilationDate: Date;

    @ManyToOne(() => MmsAsset)
    asset: MmsAsset;

    @ManyToOne(() => MmsAssetComponent)
    assetComponent: MmsAssetComponent;

    @ManyToOne(() => MmsWorkOrder)
    workOrder: MmsWorkOrder;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_checklists_mms_assigned_state_attributes"})
    assignedStateAttributes: MmsStateAttribute[];
}
