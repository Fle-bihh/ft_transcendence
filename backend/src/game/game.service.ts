import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {AuthService} from 'src/auth/auth.service';
import {Game} from 'src/entities/game.entity';
import {User} from 'src/entities/user.entity';
import {UsersService} from 'src/users/users.service';
import {Repository} from 'typeorm';
import {GameResultsDto} from './dto/game-results.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {};

  async createGame(gameResultsDto: GameResultsDto): Promise<void> {
    console.log(gameResultsDto);
    const {
      player1,
      player2,
      score1,
      score2,
      winner,
    } = gameResultsDto;
    console.log(player1);
    console.log(player2);
    console.log(gameResultsDto);

    player1.GoalSet += score1;
    player1.GoalTaken += score2;

    player2.GoalSet += score2;
    player2.GoalTaken += score1;

    const game: Game = this.gameRepository.create({
      player1,
      player2,
      score1,
      score2,
      winner,
    })

    player1.games = (await this.userService.getGames(player1)).games;
    player1.games.push(game);

    player2.games = (await this.userService.getGames(player2)).games;
    player2.games.push(game);

    try {
      await this.usersRepository.save(player1);
      await this.usersRepository.save(player2);
      await this.gameRepository.save(game);
    } catch (error) {
      console.log(error.code);
    }
  }
}
