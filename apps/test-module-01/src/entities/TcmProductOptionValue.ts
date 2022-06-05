import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable} from "typeorm";
import { TcmProductOption } from "./TcmProductOption";

@Entity()
export class TcmProductOptionValue {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "decimal", precision: 2, scale: 10})
    price: number;

    @ManyToOne(() => TcmProductOption)
    productOption: TcmProductOption;
}
