import { ColumnNumericTransformer } from "@adronix/typeorm/src";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsArea } from "./MmsArea";
import { MmsAreaModelAttribution } from "./MmsAreaModelAttribution";
import { MmsAsset } from "./MmsAsset";
import { MmsAssetComponentModel } from "./MmsAssetComponentModel";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_asset_components")
export class MmsAssetComponent {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: "decimal",
        default: 1.0,
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer()
    })
    quantity: number;

    @ManyToOne(() => MmsAsset)
    asset: MmsAsset;

    @ManyToOne(() => MmsArea)
    area: MmsArea;

    @ManyToOne(() => MmsAssetComponentModel)
    model: MmsAssetComponentModel;

}
