import {
  ConnectedSocket,
  MessageBody,
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { createServer } from 'http';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessagesDto } from 'src/channel/dto/messages.dto';
import { ChannelService } from 'src/channel/channel.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/user.entity';
import { Channel } from 'src/entities/channel.entity';
import { Interval } from '@nestjs/schedule';
import { channel } from 'diagnostics_channel';

const users = Array<{ index: number; user: any; socket: Socket }>();
const muteList = Array<{ username: string, channel: string, time: number }>();
const banList = Array<{ username: string, channel: string, time: number }>();

@WebSocketGateway({
  cors: {
    origin: '*', // on accepte les requetes venant de partout
  },
})

export class ChatGateway {
  private logger: Logger = new Logger('AppGateway');
  constructor(
    private channelsService: ChannelService,
    private usersService: UsersService,
  ) { }

  @WebSocketServer()
  httpServer = createServer();
  io = new Server(this.httpServer);

  @SubscribeMessage('CONNECT')
  connect() {
    this.logger.log('connected serverside');
  }

  // -------------------------- USERS ---------------------------

  @SubscribeMessage('BLOCK_USER')
  block_user(client: Socket, data: { username: string, target: string; }) {
    this.logger.log('BLOCK_USER recu ChatGateway', data);
    this.usersService.addBlockList(data.username, data.target);
    client.emit('updateProfileOther', { username: data.target, friendStatus: 'blocked' });
    if (users.find(user => {
      user.user.username === data.target
    })) {
      users.find(user => {
        user.user.username === data.target
      }).socket.emit('updateProfileOther', {
        username: data.username,
        friendStatus: 'blocked',
      })
    }
  }

  @SubscribeMessage('UPDATE_USER_SOCKET')
  update_user_socket(client: Socket, data: { login: string }) {
    if (users.findIndex((user) => user.user.username === data.login) >= 0) {
      users[users.findIndex((user) => user.user.username === data.login)].socket = // NE RIEN FAIRE POUR L'INSTANT
        client;
    }
    this.logger.log('UPDATE_USER_SOCKET recu ChatGateway');
  }

  @SubscribeMessage('STORE_CLIENT_INFO')
  store_client_info(client: Socket, data: { user: any; }) {
    this.logger.log("STORE_CLIENT_INFO Chat: ")
    users[users.findIndex((item) => item.socket.id == client.id)].user = data.user;
  }

  handleConnection(client: Socket) {
    // this.logger.log(`new client connected ${client.id}`);

    users.push({ index: users.length, user: {}, socket: client });
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`client ${client.id} disconnected`);
    users.splice(
      users.findIndex((item) => item.socket.id == client.id),
      1,
    );
  }

  // -------------------------- MESSAGES ---------------------------
  isMuted(username: string, channel: string): boolean {
    let check = muteList.find((u) => (u.username === username && u.channel === channel));
    if (check != undefined && check.time >= Date.now()) {
      return true;
    }
    else if (check) {
      console.log("muteList == ", muteList);
      muteList.splice(muteList.findIndex((u) => u.username === check.username && u.channel === check.channel), 1);
    }
    return false;
  }

  isBanned(username: string, channel: string): boolean {
    let check = banList.find((u) => (u.username === username && u.channel === channel));
    if (check != undefined && check.time >= Date.now()) {
      return true;
    }
    muteList.splice(banList.findIndex((u) => u.username === check.username && u.channel === check.channel), 1);
    this.logger.log(username, "is no longer banned");
    return false;
  }

  @SubscribeMessage('GET_CONV')
  async get_conv(client: Socket, data: { sender: string, receiver: string; }) {
    const senderUser = await this.usersService.getUserByUsername(data.sender);
    let receiverUser: User;
    let receiverChannel: Channel;
    try {
      receiverUser = await this.usersService.getUserByUsername(data.receiver);
    } catch (e) { this.logger.log(e.code); }
    try {
      receiverChannel = await this.channelsService.getOneChannel(data.receiver);
    } catch (e) { this.logger.log(e.code); }
    let convers;
    if (receiverUser && !(await this.usersService.isBlocked(data.sender, data.receiver))) {
      convers = await this.usersService.getConv(senderUser, receiverUser);
    }
    else if (receiverChannel) {
      convers = await this.channelsService.getConvByChannel(receiverChannel.name);
      convers = convers.reverse();
    }
    let retArray = [...convers];
    for (let conv of convers) {
      if (await this.usersService.isBlocked(data.sender, conv.sender) && !conv.serverMsg)
        retArray.splice(retArray.findIndex((u) => u.sender === conv.sender), 1);
    }
    client.emit('get_conv', retArray);
    this.logger.log('send get_conv to front', retArray);
  }

  @SubscribeMessage('GET_ALL_CONV_INFO')
  async get_all_conv_info(client: Socket, data: { sender: string }) {
    const retArray = Array<{
      receiver: string,
      last_message_time: Date,
      last_message_text: string,
      new_conv: boolean,
    }>();
    const user: User = await this.usersService.getUserByUsername(data.sender);
    const allMessages = await this.channelsService.getMessages();
    let receiver: string;
    for (let message of allMessages) {
      if (message.channel) {
        receiver = message.channel.name;
        let channel: Channel = await this.channelsService.getOneChannel(receiver);
        if ((!(await this.usersService.isBlocked(data.sender, message.sender.username)) || message.serverMsg) && channel.userConnected.find((u) => u.username === user.username
          && !retArray.find((m) => m.receiver === receiver)))
          retArray.push({ receiver: receiver, last_message_time: message.date, last_message_text: message.body, new_conv: false });
      }
      else if (message.receiver.username === data.sender) {
        receiver = message.sender.username;
        if (!(await this.usersService.isBlocked(receiver, data.sender)) && !(await this.usersService.isBlocked(data.sender, receiver)))
          if (message.receiver.username === user.username && !retArray.find((m) => m.receiver === receiver))
            retArray.push({ receiver: receiver, last_message_time: message.date, last_message_text: message.body, new_conv: false });
      }
      else {
        receiver = message.receiver.username;
        if (!(await this.usersService.isBlocked(receiver, data.sender)) && !(await this.usersService.isBlocked(data.sender, receiver)))
          if (message.sender.username === user.username && !retArray.find((m) => m.receiver === receiver))
            retArray.push({ receiver: receiver, last_message_time: message.date, last_message_text: message.body, new_conv: false });
      }
    }
    client.emit('get_all_conv_info', retArray);
    this.logger.log('send get_all_conv_info to front', retArray);
  }

  @SubscribeMessage('ADD_MESSAGE')
  async add_message(client: Socket, data: { sender: string, receiver: string, content: string, server: boolean }) {
    let sender: User = await this.usersService.getUserByUsername(data.sender);
    let receiverUser: User;
    let receiverChannel: Channel;
    try {
      receiverUser = await this.usersService.getUserByUsername(data.receiver);
    } catch (e) { this.logger.log(e.code); }
    try {
      receiverChannel = await this.channelsService.getOneChannel(data.receiver);
    } catch (e) { this.logger.log(e.code); }
    const actualTime: Date = new Date();
    if (data.server == undefined)
      data.server = false;
    const messageDto: MessagesDto = {
      date: actualTime,
      sender: sender,
      receiver: receiverUser == undefined ? null : receiverUser,
      body: data.content,
      channel: receiverChannel == undefined ? null : receiverChannel,
      serverMsg: data.server == undefined ? false : data.server,
    };
    if (receiverChannel?.userConnected.find((u) => u.username === data.sender) && !this.isMuted(data.sender, data.receiver) && (receiverChannel || (receiverUser && !(await this.usersService.isBlocked(receiverUser.username, sender.username))))) {
      await this.channelsService.createMessage(sender, messageDto);
      this.logger.log('ADD_MESSAGE recu ChatGateway');
      client.emit('new_message');
      if (receiverChannel) {
        for (let user of users) {
          if (receiverChannel.userConnected.find((u) => u.username === user.user.username))
            user.socket.emit('new_message');
        }
      }
      else {
        users.forEach(user => {
          if (user.user.username === data.receiver) {
            this.logger.log('send newMessage to', data.receiver);
            user.socket.emit('new_message');
          }
        })
      }
    }
    else { this.logger.log(data.sender, ' is muted or blocked') }
  }

  // -------------------------- CHANNELS ---------------------------

  // -------------- GET -------------

  @SubscribeMessage('GET_ALL_CHANNELS')
  async get_all_channels(client: Socket, login: string) {
    this.logger.log('GET_ALL_CHANNELS recu ChatGateway with');
    const channels = await this.channelsService.getChannel();
    const retArray = Array<{
      privacy: boolean;
        name: string;
        description: string;
        owner: string;
        password: boolean;
    }>();
    channels.forEach(channel => {
      retArray.push({
        privacy: channel.privacy,
        name: channel.name,
        description: channel.description,
        owner: channel.creator.username,
        password: channel.password.length > 0 ? true : false,
      })
    })
    client.emit('get_all_channels', retArray);
    this.logger.log('send get_all_channels to ', login, 'with', retArray);
  }

  @SubscribeMessage('GET_PARTICIPANTS')
  async get_participants(client: Socket, data: { username: string, channel: string }) {
    let userConnected: User[];
    let retArray: Array<{ username: string, admin: boolean }> = new Array<{ username: string, admin: boolean }>;
    let channel = await this.channelsService.getOneChannel(data.channel);
    try {
      userConnected = (await this.channelsService.getOneChannel(data.channel)).userConnected
    } catch (e) { userConnected = [] }
    for (let user of userConnected) {
      let admin = await this.channelsService.isAdmin(user, channel);
      retArray.push({ username: user.username, admin: admin })
    }
    client.emit('get_participants', retArray);
    this.logger.log('send get_participants with', retArray);
  }

  @SubscribeMessage('GET_PARTICIPANT_ROLE')
  async get_participant_role(client: Socket, data: { username: string, channel: string }) {
    this.logger.log('GET_PARTICIPANT_ROLE recu ChatGateway', data);
    const user = await this.usersService.getUserByUsername(data.username);
    let role: string;
    try {
      const channel = await this.channelsService.getOneChannel(data.channel);

      if (user.username === channel.creator?.username)
        role = 'owner';
      else if (await this.channelsService.isAdmin(user, channel))
        role = 'admin';
      else
        role = 'participant';
    } catch (e) { role = 'participant' }
    client.emit('get_participant_role', { role: role });
  }

  @SubscribeMessage('GET_PARTICIPANT_STATUS')
  async get_participant_status(client: Socket, data: { username: string, channel: string }) {  /////////////////////////////////////
    this.logger.log('GET_PARTICIPANT_status recu ChatGateway', data);
    let status: string;
    //  status = "ban", "mute", "null" 
    client.emit('get_participant_status', { status: status });
  }

  @SubscribeMessage('GET_CHANNEL_ADMINS')
  async get_channel_admins(client: Socket, data: { channel: string }) { /////////////////////////////////////
    let channel: Channel;
    let retArray: Array<string>;
    try {
      channel = await this.channelsService.getOneChannel(data.channel)
      retArray = await this.channelsService.getChannelAdmins(channel);
    } catch (e) {
      retArray = [];
    }
    this.logger.log('GET_CHANNEL_ADMINS recu ChatGateway', data);
    client.emit('get_channel_admins', { admins: retArray });
  }

  // -------------- ADD -------------

  @SubscribeMessage('CREATE_CHANNEL')
  async create_channel(client: Socket, data: { privacy: boolean, name: string, password: string, description: string, owner: string }) {
    this.logger.log('CREATE_CHANNEL recu ChatGateway with', data.name);
    try {
      const user = await this.usersService.getUserByUsername(data.owner);
      const channel: Channel = await this.channelsService.createChannel(user, data.name, data.password, data.description, data.privacy); // ADD MSG CHANNEL CREATED
      const retMsg = user.username + " created this channel"
      this.add_message(client, { sender: data.owner, receiver: data.name, content: retMsg, server: true });
    } catch (error) {
      this.logger.log('ERROR USER IN CREATE_CHANNEL');
    }
    this.get_all_conv_info(client, { sender: data.owner });
  }

  @SubscribeMessage('JOIN_CHANNEL')
  async join_channel(client: Socket, data: { username: string, channelName: string, channelPassword: string }) {
    this.logger.log('JOIN_CHANNEL recu ChatGateway', data);
    try {
      
      if (!this.isBanned(data.username, data.channelName)) {
        await this.channelsService.joinChannel(data.username, data.channelName, data.channelPassword); // ADD MSG X JOINED THE CHANNEL, ADD THAT IF MSG EMPTY PERSON JOINING BECOMES ADMIN
        const retMsg = data.username + " joined this channel"
        this.add_message(client, { sender: data.username, receiver: data.channelName, content: retMsg, server: true });
        client.emit('channel_joined', { channelName: data.channelName });
        this.get_all_conv_info(client, { sender: data.username });
      }
    } catch (error) {
      this.logger.log('ERROR CHANNELSERVICE IN JOIN_CHANNEL');
    }
    client.emit('banned', { channelName: data.channelName });
  }

  @SubscribeMessage('ADD_ADMIN')
  async add_admin(client: Socket, data: { new_admin: string, channel: string }) { /////////////////////////////////////
    let channel = await this.channelsService.getOneChannel(data.channel);
    await this.channelsService.addAdmin(data.new_admin, channel);
    this.logger.log('ADD_ADMIN recu ChatGateway', data);
    const retMsg = data.new_admin + " has been promoted to admin"
    this.add_message(client, { sender: data.new_admin, receiver: data.channel, content: retMsg, server: true });
    this.get_participant_role(client, { username: data.new_admin, channel: channel.name });
  }

  @SubscribeMessage('BAN_USER')
  async ban_user(client: Socket, data: { user: string, channel: string }) { /////////////////////////////////////
    this.logger.log('BAN_USER recu ChatGateway', data);
    if (banList.find((u) => (u.username === data.user && u.channel === data.channel))) {
      banList.splice(banList.findIndex((u) => (u.username === data.user && u.channel === data.channel)))
    }
    banList.push({ username: data.user, channel: data.channel, time: (Date.now() + 120000) })
    this.leave_channel(client, { login: data.user, channelName: data.channel });
    const retMsg = data.user + " has been banned"
    this.add_message(client, { sender: data.user, receiver: data.channel, content: retMsg, server: true });
  }

  @SubscribeMessage('MUTE_USER')
  async mute_user(client: Socket, data: { user: string, channel: string }) {  /////////////////////////////////////
    this.logger.log('MUTE_USER recu ChatGateway', data);
    if (muteList.find((u) => (u.username === data.user && u.channel === data.channel))) {
      muteList.splice(muteList.findIndex((u) => (u.username === data.user && u.channel === data.channel)))
    }
    muteList.push({ username: data.user, channel: data.channel, time: (Date.now() + 120000) })
    const retMsg = data.user + " has been muted"
    this.add_message(client, { sender: data.user, receiver: data.channel, content: retMsg, server: true });

    // ADD USER TO MUTE_LIST
  }

  // -------------- PATCH -------------

  @SubscribeMessage('LEAVE_CHANNEL')
  async leave_channel(client: Socket, data: { login: string, channelName: string }) {
    await this.channelsService.leaveChannel(data.login, data.channelName);
    client.emit('channel_left', { channelName: data.channelName });
    const retMsg = data.login + " left this channel"
    this.add_message(client, { sender: data.login, receiver: data.channelName, content: retMsg, server: true });
    this.get_all_conv_info(client, { sender: data.login });
  }

  @SubscribeMessage('CHANGE_CHANNEL_NAME')
  async change_channel_name(client: Socket, data: { login: string, currentName: string, newName: string }) {
    await this.channelsService.changeName(data.currentName, data.newName);
    this.logger.log('CHANGE_CHANNEL_NAME recu ChatGateway', data);
    const retMsg = data.login + " changed the channel name to " + data.newName;
    await this.add_message(client, { sender: data.login, receiver: data.newName, content: retMsg, server: true });
    await this.get_all_channels(client, data.login);
    // await this.get_all_conv_info(client, { sender: data.login });
  }

  @SubscribeMessage('CHANGE_CHANNEL_PASSWORD')
  async change_channel_password(client: Socket, data: { login: string, channelName: string, newPassword: string }) {
    this.logger.log('CHANGE_CHANNEL_PASSWORD recu ChatGateway', data);
    await this.channelsService.changePassword(data.channelName, data.newPassword); // ADD MSG PW CHANGED
    const retMsg = data.login + " changed the channel password"
    this.add_message(client, { sender: data.login, receiver: data.channelName, content: retMsg, server: true });
    this.get_all_conv_info(client, { sender: data.login });
    this.get_all_channels(client, data.login);
  }

  @SubscribeMessage('CHANGE_CHANNEL_PRIVACY')
  async change_channel_privacy(client: Socket, data: { login: string, channel: string }) { /////////////////////////////////////
    this.logger.log('CHANGE_CHANNEL_PRIVACY recu ChatGateway', data);
    const retMsg = data.login + " has changed this channels privacy"
    this.add_message(client, { sender: data.login, receiver: data.channel, content: retMsg, server: true });
  }

  @SubscribeMessage('REMOVE_ADMIN')
  async remove_admin(client: Socket, data: { new_admin: string, channel: string }) {  /////////////////////////////////////
    this.logger.log('REMOVE_ADMIN recu ChatGateway', data);
    let channel = await this.channelsService.getOneChannel(data.channel);
    let user = await this.usersService.getUserByUsername(data.new_admin);
    this.channelsService.removeAdmin(user, channel);
    const retMsg = data.new_admin + " is no longer admin"
    this.add_message(client, { sender: data.new_admin, receiver: data.channel, content: retMsg, server: true });
    // REMOVE ADMIN IN DB OF channel
  }

  @SubscribeMessage('KICK_USER')
  async kick_user(client: Socket, data: { user: string, channel: string }) {  /////////////////////////////////////
    this.logger.log('KICK_USER recu ChatGateway', data);
    let channel = await this.channelsService.getOneChannel(data.channel);
    let user = await this.usersService.getUserByUsername(data.user);
    this.channelsService.kickUser(user, channel);
    const retMsg = user.username + " has been kicked"
    this.add_message(client, { sender: data.user, receiver: data.channel, content: retMsg, server: true });
    // REMOVE USER FROM channel 
  }

}
