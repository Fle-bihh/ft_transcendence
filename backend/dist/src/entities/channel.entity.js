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
exports.Channel = void 0;
const user_entity_1 = require("./user.entity");
const typeorm_1 = require("typeorm");
const message_entity_1 = require("./message.entity");
let Channel = class Channel {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Channel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Channel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Channel.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => user_entity_1.User, user => user.channels, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Channel.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => message_entity_1.Message, message => message.channel),
    __metadata("design:type", Array)
], Channel.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(type => user_entity_1.User, user => user.channelsAdmin),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Channel.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(type => user_entity_1.User, user => user.channelsConnected, { cascade: false }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Channel.prototype, "userConnected", void 0);
Channel = __decorate([
    (0, typeorm_1.Entity)()
], Channel);
exports.Channel = Channel;
//# sourceMappingURL=channel.entity.js.map