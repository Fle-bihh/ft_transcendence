import {User} from "src/entities/user.entity";

export class GameResultsDto {
  id_user1: string;

  id_user2: string;

  score_u1: number;
  
  score_u2: number;

  winner_id: string;
}
