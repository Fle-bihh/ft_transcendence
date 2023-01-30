import { User } from "src/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Game {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(type => User, user => user.games)
    player1: User;

    @ManyToOne(type => User, user => user.games)
    player2: User;

    @Column()
    score_u1: number;

    @Column()
    score_u2: number;

    @ManyToOne(type =>User, user => user.games)
    winner: User;
}
