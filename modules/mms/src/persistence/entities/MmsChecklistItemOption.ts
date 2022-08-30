import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsAssetAttribute } from "./MmsAssetAttribute";
import { MmsChecklistItemModel } from "./MmsChecklistItemModel";


@Entity("mms_checklist_item_options")
export class MmsChecklistItemOption {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsChecklistItemModel)
    model: MmsChecklistItemModel;

    @Column()
    value: string;

    @Column()
    desc: string;

    @ManyToMany(() => MmsAssetAttribute)
    @JoinTable({name: "mms_checklist_item_options_mms_asset_attributes"})
    assetAttributes: MmsAssetAttribute[];

    @Column({ default: 0 })
    seq: number;

}
