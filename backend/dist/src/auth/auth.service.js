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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const users_service_1 = require("../users/users.service");
const rxjs_1 = require("rxjs");
let AuthService = class AuthService {
    constructor(usersRepository, jwtService, http, userService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.http = http;
        this.userService = userService;
        this.authorizationURI = 'https://api.intra.42.fr/oauth/token';
        this.clientId = 'u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9';
        this.clientSecret = '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';
        this.redirectURI = 'http://127.0.0.1:3000/home';
        this.endpoint = 'https://api.intra.42.fr/v2';
        this.logger = new common_1.Logger('AuthService');
    }
    async signIn42(auth42Dto) {
        try {
            const token = this.http.post(`${this.authorizationURI}?grant_type=authorization_code&client_id=${this.clientId}&client_secret=${this.clientSecret}&code=${auth42Dto.code}&redirect_uri=http://127.0.0.1:3000/home`);
            this.accessToken = (await (0, rxjs_1.lastValueFrom)(token)).data.access_token;
            this.headers = { Authorization: `Bearer ${this.accessToken}` };
            const response$ = this.http.get(`${this.endpoint}/me`, {
                headers: this.headers,
            });
            const { status, data } = await (0, rxjs_1.lastValueFrom)(response$);
            const authCredentialsDto = {
                username: data.login,
                password: 'Qwert_123',
                firstName: data.first_name,
                lastName: data.last_name,
                profileImage: data.image_url,
                email: data.email,
                admin: auth42Dto.admin,
            };
            const { username } = authCredentialsDto;
            let user = await this.usersRepository.findOne({ where: {
                    username: username,
                } });
            if (!user) {
                try {
                    await this.usersRepository.save(authCredentialsDto);
                }
                catch (error) {
                    console.log(error);
                    throw new common_1.InternalServerErrorException();
                }
            }
            const payload = { username };
            const accessToken = this.jwtService.sign(payload);
            return { accessToken: accessToken };
        }
        catch (error) {
            throw new common_1.HttpException(error.response.data, error.response.data);
        }
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        axios_1.HttpService,
        users_service_1.UsersService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map