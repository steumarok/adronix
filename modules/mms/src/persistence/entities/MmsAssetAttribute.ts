import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("mms_asset_attributes")
export class MmsAssetAttribute {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
