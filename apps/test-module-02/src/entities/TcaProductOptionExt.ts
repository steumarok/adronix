import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable} from "typeorm";
import { TcmProductOption } from "@adronix/test-module-01";

@Entity()
export class TcaProductOptionExt {

    constructor() {}

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nameExt: string;

    @ManyToOne(() => TcmProductOption)
    productOption: TcmProductOption;
}
