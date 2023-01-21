import { Body, Controller, Post } from '@nestjs/common';
import {UsersService} from 'src/users/users.service';
import {GameResultsDto} from './dto/game-results.dto';
import {GameService} from './game.service';

@Controller('/game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UsersService,
  ) {}

  @Post()
  async createGame(@Body()gameResultsDto: GameResultsDto) {
    console.log('yes no maybe idk');
    return await this.gameService.createGame(gameResultsDto);
  }
}
