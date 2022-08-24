import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsAreaModel } from "./MmsAreaModel";
import { MmsAssetComponentModel } from "./MmsAssetComponentModel";
import { MmsAssetModel } from "./MmsAssetModel";

@Entity("mms_asset_model_pivots")
export class MmsAssetModelPivot {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    rowGroup: number;

    @Column({ type: "decimal", default: 1.0, precision: 10, scale: 4 })
    quantity: number;

    @ManyToOne(() => MmsAssetModel)
    assetModel: MmsAssetModel;

    @ManyToOne(() => MmsAreaModel)
    areaModel: MmsAreaModel;

    @ManyToOne(() => MmsAssetComponentModel)
    componentModel: MmsAssetComponentModel;

}
