import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Game } from 'src/entities/game.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { getRepository, Repository } from 'typeorm';
import { GameResultsDto } from './dto/game-results.dto';
import { Socket } from 'socket.io';
import { parse } from 'cookie';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) { };

  async createGame(gameResultsDto: GameResultsDto): Promise<void> {
    const {
      id_user1,
      id_user2,
      score_u1,
      score_u2,
      winner_id,
    } = gameResultsDto;

    const player1 = await this.userService.getUserByUsername(id_user1);
    const player2 = await this.userService.getUserByUsername(id_user2);
    const winner = await this.userService.getUserByUsername(winner_id);
    const game: Game = this.gameRepository.create({
      player1,
      player2,
      score_u1,
      score_u2,
      winner,
    })

    if (winner.id === player1.id) {
      player1.WinNumber++;
      player2.LossNumber++;
      player1.Rank += 20;
      player2.Rank -= player2.Rank > 20 ? 20 : player2.Rank;
    }
    else {
      player2.WinNumber++;
      player1.LossNumber++;
      player2.Rank += 20;
      player1.Rank -= player1.Rank > 20 ? 20 : player1.Rank;
    }

    try {
      await this.usersRepository.save(player1);
      await this.usersRepository.save(player2);
      await this.gameRepository.save(game);
    } catch (error) {
      console.log(error.code);
    }
  }

  async getGames() {
    const games = this.gameRepository.createQueryBuilder("game")
      .leftJoinAndSelect("game.player1", "player1")
      .leftJoinAndSelect("game.player2", "player2")
      .leftJoinAndSelect("game.winner", "winner")
    return await games.getMany();
  }

  async getGamesByUser(user: User) {
    const allGames = await this.getGames();

    const result: { game: Game, player1: string, player2: string, winner: string }[] = []
    for (let game of allGames) {
      if (game.player1.username === user.username || game.player2.username === user.username) {
        let r = { game, player1: game.player1.username, player2: game.player2.username, winner: game.winner.username };
        result.push(r);
      }
    }
    return result;
  }

  async getUserFromSocket(socket: Socket): Promise<User> {
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
      const { jwt } = parse(cookies);
      return await this.authService.getUserFromToken(jwt);
    }
  }
}
