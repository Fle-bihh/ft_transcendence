import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class dbParicipatns {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    login: string;

    @Column()
    channel: string;

    @Column()
    admin: boolean;
}
