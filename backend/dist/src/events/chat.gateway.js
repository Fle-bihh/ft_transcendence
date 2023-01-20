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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socket_io_2 = require("socket.io");
const common_1 = require("@nestjs/common");
const db_messages = Array();
const db_blockList = Array();
const db_muteList = Array();
const db_banList = Array();
const db_participants = Array();
const db_channels = Array();
const users = Array();
let ChatGateway = class ChatGateway {
    constructor() {
        this.logger = new common_1.Logger('AppGateway');
        this.httpServer = (0, http_1.createServer)();
        this.io = new socket_io_2.Server(this.httpServer);
    }
    connect() {
        this.logger.log('connected serverside');
    }
    add_message(client, data) {
        if (db_blockList.find((block) => block.loginBlock === data.sender &&
            block.loginEmitter === data.receiver)) {
            return;
        }
        const actualTime = new Date();
        db_messages.push({
            index: db_messages.length,
            sender: data.sender,
            receiver: data.receiver,
            content: data.content,
            time: actualTime,
        });
        this.logger.log('ADD_MESSAGE recu ChatGateway');
        if (db_channels.find((channel) => channel.name == data.receiver)) {
            db_participants
                .filter((participant) => participant.channel == data.receiver)
                .map((participant) => {
                let tmp = users.find((user) => user.login == participant.login);
                if (tmp != undefined)
                    tmp.socket.emit('new_message');
            });
        }
        else {
            let senderUser = users.find((user) => user.login == data.sender);
            let receiverUser = users.find((user) => user.login == data.receiver);
            if (senderUser != undefined)
                senderUser.socket.emit('new_message');
            if (receiverUser != undefined)
                receiverUser.socket.emit('new_message');
        }
    }
    create_channel(client, data) {
        this.logger.log('CREATE_CHANNEL recu ChatGateway with', data.name);
        db_channels.push({
            index: db_channels.length,
            privacy: data.privacy,
            name: data.name,
            password: data.password,
            description: data.description,
            owner: data.owner,
        });
        this.logger.log('db_channels after CREATE_CHANNEL = ', db_channels);
        db_participants.push({
            index: db_participants.length,
            login: data.owner,
            channel: data.name,
            admin: true,
        });
        db_messages.push({
            index: db_messages.length,
            sender: '___server___',
            receiver: data.name,
            content: `${data.owner} created channel`,
            time: new Date(),
        });
        console.log(db_messages);
        this.get_all_conv_info(client, { sender: data.owner });
    }
    get_all_channels(client, login) {
        this.logger.log('GET_ALL_CHANNELS recu ChatGateway with');
        let sendArray = Array();
        db_channels.map((channel) => {
            sendArray.push({
                index: channel.index,
                privacy: channel.privacy,
                name: channel.name,
                password: channel.password,
                description: channel.description,
                owner: channel.owner,
            });
        });
        client.emit('get_all_channels', sendArray);
        this.logger.log('send get_all_channels to ', login, 'with', sendArray);
    }
    join_channel(client, data) {
        if (db_channels.find((item) => item.name == data.channelName) != undefined) {
            if (db_participants.filter((item) => item.channel == data.channelName)
                .length < 50) {
                if (db_participants.find((item) => item.login == data.login && item.channel == data.channelName) == undefined) {
                    if (db_channels.find((item) => item.name == data.channelName)
                        .password == data.channelPassword) {
                        db_participants.push({
                            index: db_participants.length,
                            login: data.login,
                            channel: data.channelName,
                            admin: false,
                        });
                        db_messages.push({
                            index: db_messages.length,
                            sender: '___server___',
                            receiver: data.channelName,
                            content: `${data.login} joined \'${data.channelName}\'`,
                            time: new Date(),
                        });
                        client.emit('channel_joined', {
                            channelName: data.channelName,
                        });
                        this.get_all_conv_info(client, { sender: data.login });
                    }
                }
            }
        }
    }
    add_participant(client, data) {
        console.log('ADD_PARTICIPANT recu ChatGateway', data);
        db_participants.push({
            index: db_participants.length,
            login: data.login,
            channel: data.channel,
            admin: data.admin,
        });
        db_messages.push({
            index: db_messages.length,
            sender: '___server___',
            receiver: data.channel,
            content: `${data.login} join \'${data.channel}\'`,
            time: new Date(),
        });
        db_participants
            .filter((participant) => participant.channel == data.channel)
            .map((participant) => {
            let tmp = users.find((user) => user.login == participant.login);
            if (tmp != undefined)
                tmp.socket.emit('new_message');
        });
        console.log('db_participants after ADD = ', db_participants);
    }
    change_channel_name(client, data) {
        this.logger.log('CHANGE_CHANNEL_NAME recu ChatGateway', data);
        db_channels.forEach((channel) => {
            if (channel.name === data.currentName) {
                channel.name = data.newName;
            }
        });
        db_participants.forEach((participant) => {
            if (participant.channel === data.currentName) {
                participant.channel = data.newName;
            }
        });
        db_messages.forEach((message) => {
            if (message.receiver === data.currentName) {
                message.receiver = data.newName;
            }
        });
        db_messages.push({
            index: db_messages.length,
            sender: '___server___',
            receiver: data.newName,
            content: `${data.login} changed the channel name to \'${data.newName}\'`,
            time: new Date(),
        });
        this.get_all_conv_info(client, { sender: data.login });
        this.get_all_channels(client, data.login);
    }
    change_channel_password(client, data) {
        this.logger.log('CHANGE_CHANNEL_PASSWORD recu ChatGateway', data);
        db_channels.forEach((channel) => {
            if (channel.name === data.channelName) {
                channel.password = data.newPassword;
            }
        });
        db_messages.push({
            index: db_messages.length,
            sender: '___server___',
            receiver: data.channelName,
            content: `${data.login} changed the channel password'`,
            time: new Date(),
        });
        this.get_all_conv_info(client, { sender: data.login });
        this.get_all_channels(client, data.login);
    }
    get_channel(client, data) {
        this.logger.log('GET_CHANNEL recu ChatGateway', data);
        client.emit('get_conv', db_messages
            .sort((a, b) => a.index - b.index)
            .filter((message) => message.receiver == data.receiver));
        this.logger.log('send get_conv to front', db_messages
            .sort((a, b) => a.index - b.index)
            .filter((message) => message.receiver == data.receiver));
    }
    get_conv(client, data) {
        if (db_channels.find((channel) => channel.name == data.receiver) != undefined) {
            client.emit('get_conv', db_messages
                .sort((a, b) => a.index - b.index)
                .filter((message) => message.receiver === data.receiver));
            this.logger.log('send get_conv to front');
        }
        else {
            client.emit('get_conv', db_messages
                .sort((a, b) => a.index - b.index)
                .filter((message) => (message.sender == data.sender &&
                message.receiver == data.receiver) ||
                (message.sender == data.receiver &&
                    message.receiver == data.sender)));
            this.logger.log('send get_conv to front', db_messages
                .sort((a, b) => a.index - b.index)
                .filter((message) => (message.sender == data.sender &&
                message.receiver == data.receiver) ||
                (message.sender == data.receiver &&
                    message.receiver == data.sender)));
        }
    }
    get_all_conv_info(client, data) {
        this.logger.log('GET_ALL_CONV_INFO recu ChatGateway', data);
        const retArray = Array();
        db_participants
            .filter((participant) => participant.login == data.sender)
            .map((room) => {
            const tmp = db_messages
                .sort((a, b) => b.index - a.index)
                .find((message) => message.receiver == room.channel);
            if (tmp != undefined) {
                retArray.push({
                    receiver: room.channel,
                    last_message_time: tmp.time,
                    last_message_text: tmp.content,
                    new_conv: false,
                });
            }
        });
        db_messages
            .filter((message) => message.receiver == data.sender || message.sender == data.sender)
            .map((messageItem) => {
            if (messageItem.sender == data.sender) {
                if (retArray.find((item) => item.receiver == messageItem.receiver) ==
                    undefined) {
                    let tmp = db_messages.sort((a, b) => a.index - b.index);
                    retArray.push({
                        receiver: messageItem.receiver,
                        last_message_text: tmp
                            .reverse()
                            .find((message) => (message.sender == data.sender &&
                            message.receiver == messageItem.receiver) ||
                            (message.receiver == data.sender &&
                                message.sender == messageItem.receiver)).content,
                        new_conv: false,
                        last_message_time: tmp
                            .reverse()
                            .find((message) => (message.sender == data.sender &&
                            message.receiver == messageItem.receiver) ||
                            (message.receiver == data.sender &&
                                message.sender == messageItem.receiver)).time,
                    });
                }
            }
            else if (retArray.find((item) => item.receiver == messageItem.sender) ==
                undefined) {
                let tmp = [...db_messages.sort((a, b) => a.index - b.index)];
                console.log('tmp time', tmp[0].time);
                retArray.push({
                    receiver: messageItem.sender,
                    last_message_text: tmp
                        .reverse()
                        .find((message) => (message.sender == data.sender &&
                        message.receiver == messageItem.sender) ||
                        (message.receiver == data.sender &&
                            message.sender == messageItem.sender)).content,
                    new_conv: false,
                    last_message_time: tmp
                        .reverse()
                        .find((message) => (message.sender == data.sender &&
                        message.receiver == messageItem.sender) ||
                        (message.receiver == data.sender &&
                            message.sender == messageItem.sender)).time,
                });
            }
            else {
                console.log(messageItem);
            }
        });
        console.log(retArray);
        client.emit('get_all_conv_info', retArray);
        this.logger.log('send get_all_conv_info to front', retArray);
    }
    add_user(client, data) {
        console.log('ADD_USER recu ChatGateway', data);
        users.push({
            index: users.length,
            login: data.login,
            socket: client,
        });
    }
    block_user(client, data) {
        console.log('BLOCK_USER recu ChatGateway', data);
        this.logger.log('db_block = ', db_blockList);
        if (db_blockList.find((block) => block.loginBlock === data.target && block.loginEmitter === data.login))
            return;
        db_blockList.push({
            index: users.length,
            loginBlock: data.target,
            loginEmitter: data.login,
        });
    }
    update_user_socket(client, data) {
        if (users.findIndex((user) => user.login === data.login) >= 0) {
            users[users.findIndex((user) => user.login === data.login)].socket =
                client;
        }
        this.logger.log('UPDATE_USER_SOCKET recu ChatGateway');
    }
    handleConnection(client) {
    }
    handleDisconnect(client) {
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Object)
], ChatGateway.prototype, "httpServer", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('CONNECT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "connect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ADD_MESSAGE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "add_message", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('CREATE_CHANNEL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "create_channel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('GET_ALL_CHANNELS'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "get_all_channels", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('JOIN_CHANNEL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "join_channel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ADD_PARTICIPANT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "add_participant", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('CHANGE_CHANNEL_NAME'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "change_channel_name", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('CHANGE_CHANNEL_PASSWORD'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "change_channel_password", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('GET_CHANNEL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "get_channel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('GET_CONV'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "get_conv", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('GET_ALL_CONV_INFO'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "get_all_conv_info", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ADD_USER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "add_user", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('BLOCK_USER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "block_user", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('UPDATE_USER_SOCKET'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "update_user_socket", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map