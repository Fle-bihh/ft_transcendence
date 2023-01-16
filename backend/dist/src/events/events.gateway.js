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
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socket_io_2 = require("socket.io");
const common_1 = require("@nestjs/common");
const db_users = Array();
const db_friendList = Array();
const users = Array();
let EventsGateway = class EventsGateway {
    constructor() {
        this.logger = new common_1.Logger('AppGateway');
        this.httpServer = (0, http_1.createServer)();
        this.io = new socket_io_2.Server(this.httpServer);
    }
    connect() {
        this.logger.log('connected serverside');
    }
    check_user_exist(client, userLogin) {
        this.logger.log(db_users);
        client.emit('check_user_exist', db_users.find((user) => user.login == userLogin) != undefined);
    }
    add_user(client, data) {
        console.log('ADD_USER recu EventGateway', data);
        users.push({
            index: users.length,
            login: data.login,
            socket: client,
        });
        if (!db_users.find((user) => user.login == data.login))
            db_users.push({
                index: users.length,
                login: data.login,
                password: '',
                username: data.login,
            });
    }
    update_user_socket(client, data) {
        if (users.findIndex((user) => user.login === data.login) >= 0) {
            users[users.findIndex((user) => user.login === data.login)].socket =
                client;
        }
        this.logger.log('UPDATE_USER_SOCKET recu EventGateway');
    }
    get_username(client, login) {
        this.logger.log('GET_USERNAME received back');
        client.emit('get_username', db_users.find((user) => {
            user.login === login;
        }).username);
        this.logger.log('send get_username to ', login, ' with', db_users.find((user) => {
            user.login === login;
        }).username);
    }
    get_all_users(client) {
        this.logger.log('GET_ALL_USERS received back');
        const retArray = Array();
        db_users.map((user) => {
            retArray.push({
                id: user.index,
                login: user.login,
                username: user.login,
            });
        });
        client.emit('get_all_users', retArray);
        this.logger.log('send get_all_users to front', retArray);
    }
    add_friendship(client, data) {
        this.logger.log('ADD_FRIENDSHIP received in backend');
        let tmpDate = new Date();
        db_friendList.push({
            index: db_friendList.length,
            login: data.login,
            login2: data.login2,
            friendshipDate: tmpDate,
        });
    }
    get_user_friends(client, login) {
        this.logger.log('GET_USER_FRIENDS received in backend from', login);
        let tmpArray = Array();
        db_friendList.map((friend) => {
            if (friend.login === login || friend.login2 === login) {
                tmpArray.push({
                    login: friend.login,
                    login2: friend.login2,
                    friendshipDate: friend.friendshipDate,
                });
            }
        });
        client.emit('get_user_friends', tmpArray);
        this.logger.log('send get_user_friends to ', login, 'with', tmpArray);
    }
    handleConnection(client) {
        this.logger.log(`new client connected ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`client ${client.id} disconnected`);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Object)
], EventsGateway.prototype, "httpServer", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('CONNECT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "connect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('CHECK_USER_EXIST'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "check_user_exist", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ADD_USER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "add_user", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('UPDATE_USER_SOCKET'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "update_user_socket", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('GET_USERNAME'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "get_username", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('GET_ALL_USERS'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "get_all_users", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ADD_FRIENDSHIP'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "add_friendship", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('GET_USER_FRIENDS'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "get_user_friends", null);
EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], EventsGateway);
exports.EventsGateway = EventsGateway;
//# sourceMappingURL=events.gateway.js.map