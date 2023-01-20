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
exports.ApiStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const passport_42_1 = require("passport-42");
const common_1 = require("@nestjs/common");
let ApiStrategy = class ApiStrategy extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy) {
    constructor() {
        super({
            clientID: 'u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9',
            clientSecret: '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',
            callbackURL: 'http://127.0.0.1:3000/home',
        });
    }
    async validate(accessToken, refreshToken, profile, done) {
        const user = Object.assign(Object.assign({}, profile._json), { accessToken, refreshToken });
        done(null, user);
    }
};
ApiStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ApiStrategy);
exports.ApiStrategy = ApiStrategy;
//# sourceMappingURL=42.strategy.js.map