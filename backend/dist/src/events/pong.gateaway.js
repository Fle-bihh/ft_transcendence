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
const socket_io_1 = require("socket.io");
const socket_io_2 = require("socket.io");
const common_1 = require("@nestjs/common");
const gameClass_1 = require("../pong/gameClass");
const nestjs_schedule_1 = require("nestjs-schedule");
let allClients = [];
const waintingForGame = Array();
const UserToReconnect = [];
let PongGateway = class PongGateway {
    constructor() {
        this.logger = new common_1.Logger('AppGateway');
        this.allGames = new Array();
    }
    getRoomByID(roomID) {
        for (let i = 0; i < this.allGames.length; i++)
            if (this.allGames[i].roomID == roomID)
                return [i, this.allGames[i]];
        return null;
    }
    getRoomByClientLogin(ClientLogin) {
        for (let i = 0; i < this.allGames.length; i++) {
            for (let j = 0; j < 2; j++) {
                if (this.allGames[i].players[j] != null && this.allGames[i].players[j].username == ClientLogin) {
                    return [i, this.allGames[i]];
                }
            }
        }
        return null;
    }
    getAllRoomByClientID(ClientID) {
        const tmp = [];
        this.allGames.forEach((room, index) => {
            if (room.players.find(player => player.id == ClientID) != undefined)
                tmp.push({ index: index, room: room });
        });
        return (tmp);
    }
    async update_user(client, user) {
        console.log("updateeeeeeeeeeeee");
        allClients.find(item => item.id == client.id).username = user.login;
        const room = this.getRoomByClientLogin(user.login);
        if (room) {
            console.log('Update User ', user.login, " id : ", client.id, " roomID : ", room);
            this.joinRoom(client, room[1].roomID);
        }
    }
    async joinRoom(client, roomId) {
        this.logger.log(`[Pong-Gateway] { joinRoom } Client \'${allClients.find(item => item.id == client.id).username}\' join room \'${roomId}\'`);
        client.join(roomId);
    }
    async render(roomID) {
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
                this.io.to(room[1].roomID).emit('finish', room[1]);
                return;
            }
            this.io.to(roomID).emit("render", this.allGames[room[0]]);
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
        const user = allClients.find(clients => clients.id == client.id);
        if (user != undefined && user.username != "" && user.username != undefined) {
            UserToReconnect.push({ username: user.username, date: new Date() });
        }
        allClients.splice(allClients.findIndex(item => item.id == client.id), 1);
        const allRoom = this.getAllRoomByClientID(client.id);
        for (let i = 0; i < allRoom.length; i++) {
            const player = this.allGames[allRoom[i].index].players.findIndex(player => player.id == client.id);
            this.allGames[allRoom[i].index].players[player].inGame = false;
            this.allGames[allRoom[i].index].players[player].reco = Date.now();
            if (!this.allGames[allRoom[i].index].players[0].inGame && !this.allGames[allRoom[i].index].players[1].inGame) {
                if (this.allGames[allRoom[i].index].players[1].username != "") {
                    this.allGames[allRoom[i].index].players[player].score = 3;
                    const data = {
                        id_user1: this.allGames[allRoom[i].index].players[0].id,
                        score_u1: this.allGames[allRoom[i].index].players[0].score,
                        id_user2: this.allGames[allRoom[i].index].players[1].id,
                        score_u2: this.allGames[allRoom[i].index].players[1].score,
                        winner_id: this.allGames[allRoom[i].index].players[0].score === 3 ? this.allGames[allRoom[i].index].players[0].id : this.allGames[allRoom[i].index].players[1].id,
                    };
                    this.allGames[allRoom[i].index].players.forEach((item, index) => {
                        if (!item.inGame && item.id != client.id) {
                            allClients.forEach((client) => {
                                if (client.username == item.username)
                                    this.io.to(client.id).emit('notif', { type: 'LOOSEGAMEDISCONECT', data: { opponentLogin: this.allGames[allRoom[i].index].players[index ? 0 : 1].username, roomId: this.allGames[allRoom[i].index].roomID } });
                            });
                        }
                    });
                    this.io.to(this.allGames[allRoom[i].index].roomID).emit('finish', this.allGames[allRoom[i].index]);
                }
                this.allGames.splice(allRoom[i].index, 1);
                this.logger.log(`client ${client.id} disconnect`);
            }
        }
    }
    async checkReconnexion(client, user) {
        const room = this.getRoomByClientLogin(user.login);
        if (room != null) {
            this.joinRoom(client, this.allGames[room[0]].roomID);
            this.allGames[room[0]].players[this.allGames[room[0]].players.findIndex(player => player.username == user.login)].id = client.id;
            this.allGames[room[0]].players[this.allGames[room[0]].players.findIndex(player => player.username == user.login)].inGame = true;
            allClients.forEach((client) => {
                this.io.to(client.id).emit('getClientStatus', { user: this.allGames[room[0]].players[this.allGames[room[0]].players.findIndex(player => player.username == user.login)].username, status: 'in-game', emitFrom: 'CHECK_RECONNEXION' });
            });
            this.io.to(client.id).emit('start', room[1].roomID);
        }
    }
    clientStatusGame() {
        UserToReconnect.forEach(async (user, index) => {
            if (new Date().getSeconds() - user.date.getSeconds() != 0) {
                allClients.forEach((client) => {
                    this.io.to(client.id).emit('getClientStatus', { user: user.username, status: 'offline', emitFrom: 'clientStatusGame' });
                });
                this.logger.log(`[Pong-Gateway] Client \'${user.username}\' disconnect`);
                UserToReconnect.splice(index, 1);
            }
        });
    }
    async handleInterval() {
        for (let index = 0; index < this.allGames.length; index++) {
            if (this.allGames[index].gameOn) {
                let stop = false;
                for (let i = 0; i < 2; i++)
                    if (!this.allGames[index].players[i].inGame) {
                        this.allGames[index].players[i].ready = false;
                        if ((15 - Math.floor((Date.now() - this.allGames[index].players[i].reco) / 1000)) == 0 && this.allGames[index].players[i ? 0 : 1].score != 3) {
                            var room = this.getRoomByID(this.allGames[index].roomID);
                            this.allGames[index].players[i ? 0 : 1].score = 3;
                            const data = {
                                id_user1: room[1].players[0].id,
                                score_u1: room[1].players[0].score,
                                id_user2: room[1].players[1].id,
                                score_u2: room[1].players[1].score,
                                winner_id: room[1].players[0].score === 3 ? room[1].players[0].id : room[1].players[1].id,
                            };
                            room[1].players.forEach((item, index) => {
                                if (!item.inGame) {
                                    allClients.forEach((client) => {
                                        if (client.username == item.username)
                                            client.socket.emit('notif', { type: 'LOOSEGAMEDISCONECT', data: { opponentLogin: room[1].players[index ? 0 : 1].username, roomId: room[1].roomID } });
                                    });
                                }
                            });
                            stop = true;
                            this.io.to(room[1].roomID).emit('finish', room[1]);
                            this.allGames.splice(room[0], 1);
                        }
                    }
                    else if (this.allGames[index].players[i ? 0 : 1].inGame)
                        if (!(this.allGames[index].players[0].score == 3 || this.allGames[index].players[1].score == 3))
                            if (this.allGames[index].players[0].ready && this.allGames[index].players[1].ready)
                                this.allGames[index].moveAll();
                if (!stop) {
                    this.render(this.allGames[index].roomID);
                }
            }
        }
    }
    async enter(client, info) {
        var room = this.getRoomByID(info[0]);
        if (room != null) {
            for (let index = 0; index < 2; index++)
                if (this.allGames[room[0]].players[index].id == client.id)
                    this.allGames[room[0]].players[index].ready = true;
        }
    }
    async arrowUp(client, info) {
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
        if ((oponnent = waintingForGame.find(item => item.map == info.gameMap)) != undefined) {
            this.allGames.push(new gameClass_1.GameClass(info.gameMap, info.user.login, info.user.login + oponnent.user.login, client.id));
            const room = this.getRoomByID(info.user.login + oponnent.user.login);
            this.allGames[room[0]].players[0].inGame = true;
            this.allGames[room[0]].setOponnent(allClients.find(client => client.username == oponnent.user.login).id, oponnent.user.login);
            this.allGames[room[0]].gameOn = true;
            this.joinRoom(client, room[1].roomID);
            allClients.find(client => client.username == oponnent.user.login).socket.emit('joinRoom', room[1].roomID);
            allClients.find(client => client.username == oponnent.user.login).socket.emit('start', room[1].roomID);
            this.io.to(client.id).emit('start', room[1].roomID);
            waintingForGame.splice(waintingForGame.findIndex(item => item.map == info.gameMap), 1);
            console.table(waintingForGame);
            console.table(this.allGames);
            console.table(allClients);
        }
        else {
            waintingForGame.push({ map: info.gameMap, user: info.user });
            this.io.to(client.id).emit('joined_waiting', info.user);
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_2.Server)
], PongGateway.prototype, "io", void 0);
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
    (0, websockets_1.SubscribeMessage)('CHECK_RECONNEXION'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "checkReconnexion", null);
__decorate([
    (0, nestjs_schedule_1.Interval)(1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PongGateway.prototype, "clientStatusGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('HANDLE_INTERVAL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "handleInterval", null);
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
    (0, websockets_1.WebSocketGateway)(5002, { transports: ['websocket'] })
], PongGateway);
exports.PongGateway = PongGateway;
//# sourceMappingURL=pong.gateaway.js.map