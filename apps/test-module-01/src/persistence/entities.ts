import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity()
export class TcmIngredient {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}

@Entity()
export class TcmShop {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}

@Entity()
export class TcmProductOption {

    constructor() {}

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: "integer" })
    quantity: number;

    @ManyToMany(() => TcmIngredient)
    @JoinTable()
    ingredients: TcmIngredient[];

    @ManyToOne(() => TcmShop)
    shop: TcmShop;
}

@Entity()
export class TcmProductOptionValue {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "decimal", precision: 2, scale: 10})
    price: number;

    @ManyToOne(() => TcmProductOption)
    productOption: TcmProductOption;
}
