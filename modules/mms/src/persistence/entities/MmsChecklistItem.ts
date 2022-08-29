import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsAssetComponent } from "./MmsAssetComponent";
import { MmsChecklistItemModel } from "./MmsChecklistItemModel";
import { MmsChecklistModel } from "./MmsChecklistModel";


@Entity("mms_checklist_items")
export class MmsChecklistItem {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    notes: string;

    @ManyToOne(() => MmsChecklistItemModel)
    itemModel: MmsChecklistItemModel;

    @ManyToOne(() => MmsAssetComponent)
    assetComponent: MmsAssetComponent;

    @Column()
    value: string;
}
