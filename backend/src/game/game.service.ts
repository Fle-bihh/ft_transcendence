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
      id_user1,
      id_user2,
      score_u1,
      score_u2,
      winner_id,
    } = gameResultsDto;

    const player1 = await this.userService.getUserByLogin(id_user1);
    const player2 = await this.userService.getUserByLogin(id_user2);
    const winner = await this.userService.getUserByLogin(winner_id);
    const game: Game = this.gameRepository.create({
      player1,
      player2,
      score_u1,
      score_u2,
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
