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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const user_credentials_dto_1 = require("./dto/user-credentials.dto");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async signUp(usersCredentialsDto) {
        return this.usersService.signUp(usersCredentialsDto);
    }
    async patchUsername(id, user, username) {
        console.log('bonjour');
        return this.usersService.patchUsername(id, user, username);
    }
    async activate2FA(user) {
        return await this.usersService.activate2FA(user);
    }
    async getUserById(id, user) {
        return await this.usersService.getUserById(id, user);
    }
    async getUserByLogin(login) {
        return await this.usersService.getUserByLogin(login);
    }
    async getMatchHistory(id, user) {
        return await this.usersService.getMatchHistory(id, user);
    }
    async get2FA(user) {
        return await this.usersService.get2FA(user);
    }
};
__decorate([
    (0, common_1.Post)('/signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_credentials_dto_1.UserCredentialsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "signUp", null);
__decorate([
    (0, common_1.Patch)('/:id/username'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "patchUsername", null);
__decorate([
    (0, common_1.Patch)('2FA/activate'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "activate2FA", null);
__decorate([
    (0, common_1.Get)('/id/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Get)('/login/:login'),
    __param(0, (0, common_1.Param)('login')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserByLogin", null);
__decorate([
    (0, common_1.Get)('/:id/match_history'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMatchHistory", null);
__decorate([
    (0, common_1.Get)('2FA/active'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get2FA", null);
UsersController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map