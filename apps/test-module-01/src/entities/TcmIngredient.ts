import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";

@Entity()
export class TcmIngredient {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
