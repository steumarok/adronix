import { ColumnNumericTransformer } from "@adronix/typeorm/src";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { MmsArea } from "./MmsArea";
import { MmsAssetAttribute } from "./MmsAssetAttribute";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_assets")
export class MmsAsset {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => MmsAssetModel)
    model: MmsAssetModel;

    @ManyToOne(() => MmsClient)
    client: MmsClient;

    @ManyToOne(() => MmsClientLocation)
    location: MmsClientLocation;

    @ManyToOne(() => MmsArea)
    area: MmsArea;

    @ManyToMany(() => MmsAssetAttribute)
    @JoinTable({name: "mms_assets_mms_attributes"})
    attributes: MmsAssetAttribute[];

    @Column({
        type: "decimal",
        default: 1.0,
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer()
    })
    quantity: number;

}
