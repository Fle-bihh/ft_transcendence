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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.clientId = 'u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9';
        this.clientSecret = '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';
        this.redirectUri = 'localhost:3000/home';
    }
    async validateOAuthLogin(profile) {
        const { code } = profile;
        const tokenResponse = await axios_1.default.post('https://api.intra.42.fr/oauth/token', {
            code,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri,
            grant_type: 'authorization_code',
        });
        const { access_token } = tokenResponse.data;
        const user = await this.getUserByToken(access_token);
        const payload = { sub: user.id };
        return this.jwtService.sign(payload);
    }
    async getUserByToken(token) {
        const userResponse = await axios_1.default.get('https://api.intra.42.fr/v2/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return userResponse.data;
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map