import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum MmsChecklistItemType {
    BOOL = 'bool',
    RANGE = 'range',
    OPTION = 'option'
}

@Entity("mms_checklist_item_models")
export class MmsChecklistItemModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column({
        type: 'enum',
        enum: MmsChecklistItemType
    })
    dataType: MmsChecklistItemType;

    @Column({ nullable: true, length: 4096 })
    typeOptions: string;
}
