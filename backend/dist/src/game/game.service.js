"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_service_1 = require("../auth/auth.service");
const game_entity_1 = require("../entities/game.entity");
const user_entity_1 = require("../entities/user.entity");
const users_service_1 = require("../users/users.service");
const typeorm_2 = require("typeorm");
let GameService = class GameService {
    constructor(gameRepository, usersRepository, authService, userService) {
        this.gameRepository = gameRepository;
        this.usersRepository = usersRepository;
        this.authService = authService;
        this.userService = userService;
    }
    ;
    async createGame(gameResultsDto) {
        console.log(gameResultsDto);
        const { player1, player2, score1, score2, winner, } = gameResultsDto;
        console.log(player1);
        console.log(player2);
        console.log(gameResultsDto);
        player1.GoalSet += score1;
        player1.GoalTaken += score2;
        player2.GoalSet += score2;
        player2.GoalTaken += score1;
        const game = this.gameRepository.create({
            player1,
            player2,
            score1,
            score2,
            winner,
        });
        player1.games = (await this.userService.getGames(player1)).games;
        player1.games.push(game);
        player2.games = (await this.userService.getGames(player2)).games;
        player2.games.push(game);
        try {
            await this.usersRepository.save(player1);
            await this.usersRepository.save(player2);
            await this.gameRepository.save(game);
        }
        catch (error) {
            console.log(error.code);
        }
    }
};
GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_entity_1.Game)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        auth_service_1.AuthService,
        users_service_1.UsersService])
], GameService);
exports.GameService = GameService;
//# sourceMappingURL=game.service.js.map