import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne, JoinColumn} from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsAssetComponent } from "./MmsAssetComponent";
import { MmsChecklist } from "./MmsChecklist";
import { MmsChecklistItemModel } from "./MmsChecklistItemModel";
import { MmsChecklistItemOption } from "./MmsChecklistItemOption";
import { MmsChecklistModel } from "./MmsChecklistModel";


@Entity("mms_checklist_items")
export class MmsChecklistItem {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    notes: string;

    @ManyToOne(() => MmsChecklistItemModel)
    itemModel: MmsChecklistItemModel;

    @ManyToOne(() => MmsAssetComponent, { nullable: true })
    assetComponent: MmsAssetComponent;

    @ManyToOne(() => MmsChecklist)
    checklist: MmsChecklist;

    @ManyToOne(() => MmsChecklistItemOption)
    option: MmsChecklistItemOption;

    @Column()
    value: string;
}
