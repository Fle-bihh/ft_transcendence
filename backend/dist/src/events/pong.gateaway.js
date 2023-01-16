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
exports.PongGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socket_io_2 = require("socket.io");
const common_1 = require("@nestjs/common");
const gameClass_1 = require("../pong/gameClass");
let allClients = [];
const waintingForGame = Array();
let PongGateway = class PongGateway {
    constructor() {
        this.logger = new common_1.Logger('AppGateway');
        this.allGames = new Array();
        this.httpServer = (0, http_1.createServer)();
        this.io = new socket_io_2.Server(this.httpServer);
    }
    getRoomByID(roomID) {
        for (let i = 0; i < this.allGames.length; i++)
            if (this.allGames[i].roomID == roomID)
                return [i, this.allGames[i]];
        return null;
    }
    async update_user(client, user) {
        allClients.find(item => item.id == client.id).username = user.login;
        console.log('Update User ', user.login, " id : ", client.id);
    }
    async joinRoom(client, roomId) {
        this.logger.log(`[Pong-Gateway] { joinRoom } Client \'${allClients.find(item => item.id == client.id).username}\' join room \'${roomId}\'`);
        client.join(roomId);
    }
    async render(client, roomID) {
        var room = this.getRoomByID(roomID);
        if (room != null) {
            if (this.allGames[room[0]].players[0].score == 3 || this.allGames[room[0]].players[1].score == 3) {
                const data = {
                    id_user1: room[1].players[0].id,
                    score_u1: room[1].players[0].score,
                    id_user2: room[1].players[1].id,
                    score_u2: room[1].players[1].score,
                    winner_id: room[1].players[0].score === 3 ? room[1].players[0].id : room[1].players[1].id,
                };
                this.allGames.splice(room[0], 1);
                client.emit('finish', room[1]);
                return;
            }
            this.allGames[room[0]];
            client.emit('render', this.allGames[room[0]]);
        }
    }
    handleConnection(client) {
        const newClient = {
            id: client.id,
            username: "",
            socket: client
        };
        allClients.push(newClient);
    }
    handleDisconnect(client) {
        allClients.splice(allClients.findIndex(item => item.id == client.id), 1);
        this.logger.log(`client ${client.id} disconnected`);
    }
    async enter(client, info) {
        var room = this.getRoomByID(info[0]);
        console.log('ENTER', room);
        console.log('player 1', room[1].players[0]);
        console.log('player 2', room[1].players[1]);
        if (room != null) {
            for (let index = 0; index < 2; index++)
                if (this.allGames[room[0]].players[index].id == client.id)
                    if (!this.allGames[room[0]].players[0].ready || !this.allGames[room[0]].players[1].ready) {
                        this.allGames[room[0]].players[index].ready = true;
                    }
        }
    }
    async arrowUp(client, info) {
        console.log('UP');
        var room = this.getRoomByID(info[0]);
        if (room != null) {
            for (let index = 0; index < 2; index++)
                if (this.allGames[room[0]].players[index].id == client.id) {
                    this.allGames[room[0]].players[index].goUp = info[1];
                    if (info[1])
                        this.allGames[room[0]].players[index].goDown = false;
                }
        }
    }
    async arrowDown(client, info) {
        console.log('DOWN');
        var room = this.getRoomByID(info[0]);
        if (room != null) {
            for (let index = 0; index < 2; index++)
                if (this.allGames[room[0]].players[index].id == client.id) {
                    this.allGames[room[0]].players[index].goDown = info[1];
                    if (info[1])
                        this.allGames[room[0]].players[index].goUp = false;
                }
        }
    }
    async startGame(client, info) {
        let oponnent;
        console.log("start game back");
        if ((oponnent = waintingForGame.find(item => item.map == info.gameMap)) != undefined) {
            console.log("start game back 1");
            console.table(allClients);
            this.allGames.push(new gameClass_1.GameClass(info.gameMap, info.user.login, info.user.login + oponnent.user.login, client.id));
            const room = this.getRoomByID(info.user.login + oponnent.user.login);
            this.allGames[room[0]].setOponnent(allClients.find(client => client.username == oponnent.user.login).id, oponnent.user.login);
            this.allGames[room[0]].gameOn = true;
            this.joinRoom(client, room[1].roomID);
            console.log('socket ID moi : ', client.id);
            console.log('socket ID other : ', allClients.find(client => client.username == oponnent.user.login).id);
            allClients.find(client => client.username == oponnent.user.login).socket.emit('joinRoom', room[1].roomID);
            allClients.find(client => client.username == oponnent.user.login).socket.emit('start', room[1].roomID);
            client.emit('start', room[1].roomID);
            waintingForGame.splice(waintingForGame.findIndex(item => item.map == info.gameMap), 1);
            console.table(waintingForGame);
            console.table(this.allGames);
            console.table(allClients);
        }
        else {
            console.log("start game back 2");
            waintingForGame.push({ map: info.gameMap, user: info.user });
            client.emit('joined');
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Object)
], PongGateway.prototype, "httpServer", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('UPDATE_USER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "update_user", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('JOIN_ROOM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "joinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('RENDER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "render", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ENTER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "enter", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ARROW_UP'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "arrowUp", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ARROW_DOWN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "arrowDown", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('START_GAME'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "startGame", null);
PongGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], PongGateway);
exports.PongGateway = PongGateway;
//# sourceMappingURL=pong.gateaway.js.map