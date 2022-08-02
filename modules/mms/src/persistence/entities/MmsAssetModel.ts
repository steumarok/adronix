import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("mms_asset_models")
export class MmsAssetModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
