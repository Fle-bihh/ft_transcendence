import { User } from "src/entities/user.entity";
export declare class Game {
    id: string;
    player1: User;
    player2: User;
    score1: number;
    score2: number;
    winner: User;
}
