import { ColumnNumericTransformer } from "@adronix/typeorm/src";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MmsArea } from "./MmsArea";
import { MmsAsset } from "./MmsAsset";
import { MmsAssetComponentModel } from "./MmsAssetComponentModel";
import { MmsStateAttribute } from "./MmsStateAttribute";

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

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_asset_components_mms_state_attributes"})
    stateAttributes: MmsStateAttribute[];
}
