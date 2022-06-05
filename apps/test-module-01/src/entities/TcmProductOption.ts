import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable} from "typeorm";
import { TcmIngredient } from "./TcmIngredient";

@Entity()
export class TcmProductOption {

    constructor() {}

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => TcmIngredient)
    @JoinTable()
    ingredients: TcmIngredient[];
}
