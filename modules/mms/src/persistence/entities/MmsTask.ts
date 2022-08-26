import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { MmsAsset } from "./MmsAsset";
import { MmsAssetComponent } from "./MmsAssetComponent";
import { MmsTaskModel } from "./MmsTaskModel";

@Entity("mms_tasks")
export class MmsTask {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: number;

    @Column()
    codePrefix: string;

    @Column()
    codeSuffix: string;

    @ManyToOne(() => MmsAsset)
    asset: MmsAsset;

    @ManyToOne(() => MmsTaskModel)
    model: MmsTaskModel;

    @Column({ nullable: true })
    scheduledDate: Date;

    @Column({ nullable: true })
    executionDate: Date;

    @Column({ nullable: true })
    completeDate: Date;
}
