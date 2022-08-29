import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsAssetComponent } from "./MmsAssetComponent";
import { MmsAssetComponentModel } from "./MmsAssetComponentModel";
import { MmsChecklistModel } from "./MmsChecklistModel";

export enum MmsChecklistModelItemType {
    BOOL = 'bool',
    RANGE = 'range',
    OPTION = 'option'
}

@Entity("mms_checklist_model_items")
export class MmsChecklistModelItem {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @ManyToOne(() => MmsChecklistModel)
    model: MmsChecklistModel;

    @ManyToMany(() => MmsAssetComponentModel)
    @JoinTable({name: "mms_checklist_model_items_mms_asset_component_models"})
    assetComponentModels: MmsAssetComponentModel[];

    @Column({
        type: 'enum',
        enum: MmsChecklistModelItemType
    })
    dataType: MmsChecklistModelItemType;

    @Column()
    typeOptions: string;
}
