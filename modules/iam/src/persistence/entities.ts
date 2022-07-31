import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne} from "typeorm";

@Entity("iam_users")
export class IamUser {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

}
