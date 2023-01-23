import {User} from "src/entities/user.entity";

export class GameResultsDto {
  player1: User;

  player2: User;

  score1: number;
  
  score2: number;

  winner: User;
}