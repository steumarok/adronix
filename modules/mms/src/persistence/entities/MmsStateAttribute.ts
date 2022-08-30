import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("mms_state_attributes")
export class MmsStateAttribute {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_state_attributes_incompatible"})
    incompatibleAttributes: MmsStateAttribute[];

    @Column({ nullable: true })
    forAsset: boolean;

    @Column({ nullable: true })
    forAssetComponent: boolean;

    @Column({ nullable: true })
    forTask: boolean;

    @Column({ nullable: true })
    forWorkOrder: boolean;
}
