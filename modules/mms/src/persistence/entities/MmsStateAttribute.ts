import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("mms_state_attributes")
export class MmsStateAttribute {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_state_attributes_incompatible"})
    incompatibleAttributes: MmsStateAttribute[];

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_state_attributes_containers"})
    containers: MmsStateAttribute[];

    @Column({ nullable: true })
    asInitialState: boolean;

    @Column({ nullable: true })
    autoAssigned: boolean;

    @Column({ nullable: true })
    forAsset: boolean;

    @Column({ nullable: true })
    forAssetComponent: boolean;

    @Column({ nullable: true })
    forTask: boolean;

    @Column({ nullable: true })
    withWorkOrder: boolean;


    @Column({ nullable: true })
    forWorkOrder: boolean;

    @ManyToMany(() => MmsStateAttribute)
    @JoinTable({name: "mms_state_attributes_with_all_task_states"})
    withAllTaskStates: MmsStateAttribute[];

    @Column({ nullable: true })
    withMandatoryChecklists: boolean;
}
