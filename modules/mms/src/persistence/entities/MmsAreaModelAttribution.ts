import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";
import { MmsArea } from "./MmsArea";
import { MmsAreaModel } from "./MmsAreaModel";
import { MmsClient } from "./MmsClient";
import { MmsClientLocation } from "./MmsClientLocation";

@Entity("mms_area_model_attributions")
export class MmsAreaModelAttribution {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MmsArea)
    area: MmsArea;

    @ManyToOne(() => MmsAreaModel)
    model: MmsAreaModel;

}
