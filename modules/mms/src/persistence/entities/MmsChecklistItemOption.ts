import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsChecklistItemModel } from "./MmsChecklistItemModel";
import { MmsStateAttribute } from "./MmsStateAttribute";


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

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_checklist_item_options_mms_state_attributes"})
    stateAttributes: MmsStateAttribute[];

    @Column({ default: 0 })
    seq: number;

}
