import {Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    privacy: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    description: string;

    @Column()
    owner: string;
}
