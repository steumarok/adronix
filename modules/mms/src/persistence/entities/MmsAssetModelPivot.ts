import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsArea } from "./MmsArea";
import { MmsAreaModel } from "./MmsAreaModel";
import { MmsAreaModelAttribution } from "./MmsAreaModelAttribution";
import { MmsAsset } from "./MmsAsset";
import { MmsAssetComponentModel } from "./MmsAssetComponentModel";
import { MmsAssetModel } from "./MmsAssetModel";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_asset_model_pivots")
export class MmsAssetModelPivot {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    rowGroup: number;

    @Column()
    quantity: number;

    @ManyToOne(() => MmsAssetModel)
    assetModel: MmsAssetModel;

    @ManyToOne(() => MmsAreaModel)
    areaModel: MmsAreaModel;

    @ManyToOne(() => MmsAssetComponentModel)
    componentModel: MmsAssetComponentModel;

}
