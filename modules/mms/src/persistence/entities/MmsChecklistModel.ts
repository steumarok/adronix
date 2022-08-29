import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { MmsChecklistItemModel } from "./MmsChecklistItemModel";

@Entity("mms_checklist_models")
export class MmsChecklistModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => MmsChecklistItemModel)
    @JoinTable({name: "mms_checklist_models_mms_checklist_item_models"})
    checklistItemModels: MmsChecklistItemModel[];
}
