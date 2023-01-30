import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { GameResultsDto } from './dto/game-results.dto';
import { GameService } from './game.service';

@Controller('/game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UsersService,
  ) { }

  @Post()
  async createGame(@Body() gameResultsDto: GameResultsDto) {
    console.log('yes no maybe idk');
    return await this.gameService.createGame(gameResultsDto);
  }

  @Get('/:id')
  async getGamesById(@Param('id') id: string, @GetUser() user: User) {
    const found = await this.userService.getUserById(id);
    console.log('cassé');
    return this.gameService.getGamesByUser(found);
  }
}
