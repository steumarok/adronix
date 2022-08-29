import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsAssetComponent } from "./MmsAssetComponent";
import { MmsChecklistModel } from "./MmsChecklistModel";
import { MmsChecklistModelItem } from "./MmsChecklistModelItem";


@Entity("mms_checklist_items")
export class MmsChecklistItem {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    notes: string;

    @ManyToOne(() => MmsChecklistModelItem)
    model: MmsChecklistModelItem;

    @ManyToOne(() => MmsAssetComponent)
    assetComponent: MmsAssetComponent;

    @Column()
    value: string;
}
