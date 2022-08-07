import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("mms_asset_attributes")
export class MmsAssetAttribute {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => MmsAssetAttribute)
    @JoinTable({name: "mms_asset_attributes_incompatible"})
    incompatibleAttributes: MmsAssetAttribute[];
}
