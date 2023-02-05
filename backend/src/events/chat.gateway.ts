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
import { MessagesService } from 'src/messages/messages.service';
import { User } from 'src/entities/user.entity';
import { Channel } from 'src/entities/channel.entity';
import { Message } from 'src/entities/message.entity';

const db_blockList = Array<{
  index: number;
  loginBlock: string;
  loginEmitter: string;
}>();
const users = Array<{ index: number; user: any; socket: Socket }>();

@WebSocketGateway({
  cors: {
    origin: '*', // on accepte les requetes venant de partout
  },
})
export class ChatGateway {
  private logger: Logger = new Logger('AppGateway');
  constructor(
    private messagesService: MessagesService,
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
  block_user(client: Socket, data: { login: string, target: string; }) {
    console.log('BLOCK_USER recu ChatGateway', data);
    this.usersService.addBlockList(data.login, data.target);
    this.logger.log('db_block = ', db_blockList);
  }

  @SubscribeMessage('UPDATE_USER_SOCKET')
  update_user_socket(client: Socket, data: { login: string }) {
    // if (users.findIndex((user) => user.login === data.login) >= 0) {
    //   users[users.findIndex((user) => user.login === data.login)].socket = // NE RIEN FAIRE POUR L'INSTANT
    //     client;
    // }
    // this.logger.log('UPDATE_USER_SOCKET recu EventGateway');
  }

  @SubscribeMessage('STORE_CLIENT_INFO')
  store_client_info(client: Socket, data: { user: any }) {
    // users[users.findIndex((item) => item.socket.id == client.id)].user =
    //   data.user;
    //
    // client.emit('store_client_done');
    // if (users.findIndex((user) => user.login === data.login) >= 0) {
    //   users[users.findIndex((user) => user.login === data.login)].socket = // NE RIEN FAIRE POUR L'INSTANT
    //     client;
    // }
    // this.logger.log('UPDATE_USER_SOCKET recu EventGateway');
  }

  handleConnection(client: Socket) {
    // this.logger.log(`new client connected ${client.id}`);
    //
    // users.push({ index: users.length, user: {}, socket: client });
  }

  handleDisconnect(client: Socket) {
    //   this.logger.log(`client ${client.id} disconnected`);
    //   users.splice(
    //     users.findIndex((item) => item.socket.id == client.id),
    //     1,
    //   );
  }

  // -------------------------- MESSAGES ---------------------------

  @SubscribeMessage('GET_CONV')
  async get_conv(client: Socket, data: { sender: string, receiver: string; }) {
    const senderUser = await this.usersService.getUserByUsername(data.sender);
    let receiverUser: User;
    let receiverChannel: Channel;
    try {
      receiverUser = await this.usersService.getUserByUsername(data.receiver);
    } catch (e) { console.log(e.code); }
    try {
      receiverChannel = await this.channelsService.getOneChannel(data.receiver);
    } catch (e) { console.log(e.code); }
    let convers;
    if (receiverUser)
      convers = await this.usersService.getConv(senderUser, receiverUser);
    else if (receiverChannel)
      convers = await this.channelsService.getConvByChannel(receiverChannel.name);
    client.emit('get_conv', convers);
    this.logger.log('send get_conv to front', convers);
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
    const tmp = allMessages.reverse();
    for (let message of tmp) {
      let receiver = (message.channel ? message.channel.name : message.receiver.username);
      if (message.sender && message.sender.username === user.username && !retArray.find((m) => m.receiver === receiver)) {
        retArray.push({ receiver: receiver, last_message_time: message.date, last_message_text: message.body, new_conv: false });
      }
      receiver = (message.channel ? message.channel.name : message.sender.username);
      if (message.receiver && message.receiver.username === user.username && !retArray.find((m) => m.receiver === receiver)) {
        retArray.push({ receiver: receiver, last_message_time: message.date, last_message_text: message.body, new_conv: false });
      }
    }
    client.emit('get_all_conv_info', retArray);
    this.logger.log('send get_all_conv_info to front', retArray);
  }
  @SubscribeMessage('ADD_MESSAGE')
  async add_message(client: Socket, data: { sender: string, receiver: string, content: string }) {
    let sender: User = await this.usersService.getUserByUsername(data.sender);
    let receiverUser: User;
    try {
      receiverUser = await this.usersService.getUserByUsername(data.receiver);
    } catch (e) { console.log(e.code); }
    try {
      await this.channelsService.getOneChannel(data.receiver);
    } catch (e) { console.log(e.code); }

    const receiverChannel = await this.channelsService.getOneChannel(data.receiver);
    const actualTime: Date = new Date();
    const messageDto: MessagesDto = {
      date: actualTime,
      sender: sender,
      receiver: receiverUser,
      body: data.content,
      channel: receiverChannel,
    };

    this.channelsService.createMessage(sender, messageDto);
    this.logger.log('ADD_MESSAGE recu ChatGateway');
    // CHECK EMIT ET LOGGER
    //   this.logger.log('send newMessage to', sender.user.login);
    //   if (sender != undefined) {
    // sender.socket.emit('new_message');
    //   }
    //   this.logger.log('send newMessage to', receiver.user.login);
    //   if (receiver != undefined) {
    //     receiver.socket.emit('new_message');
    //   }
    // }
  }

  // -------------------------- CHANNELS ---------------------------

  // -------------- GET -------------

  @SubscribeMessage('GET_ALL_CHANNELS')
  async get_all_channels(client: Socket, login: string) {
    this.logger.log('GET_ALL_CHANNELS recu ChatGateway with');
    const channels = await this.channelsService.getChannel();
    client.emit('get_all_channels', channels);
    this.logger.log('send get_all_channels to ', login, 'with', channels);
  }

  @SubscribeMessage('GET_PARTICIPANTS')
  async get_participants(client: Socket, data: { login: string, channel: string }) {
    let userConnected;
    try {
      userConnected = (await this.channelsService.getOneChannel(data.channel)).userConnected
    } catch (e) { userConnected = [] }
    client.emit('get_participants', userConnected);
    this.logger.log('send get_participants to', data.login);
  }

  @SubscribeMessage('GET_PARTICIPANT_ROLE')
  async get_participant_role(client: Socket, data: { login: string, channel: string }) {
    const user = await this.usersService.getUserByUsername(data.login);
    let role: string;
    try {
      const channel = await this.channelsService.getOneChannel(data.channel);

      if (user.username === channel.creator?.username)
        role = 'owner';
      else if (user.channelsAdmin.find((channel) => channel.name === data.channel))
        role = 'admin';
      else
        role = 'participant';
    } catch (e) { role = 'participant' }
    console.log('GET_PARTICIPANT_ROLE recu ChatGateway', data);
    client.emit('get_participant_role', { role: role });
  }

  @SubscribeMessage('GET_PARTICIPANT_STATUS')
  async get_participant_status(client: Socket, data: { username: string, channel: string }) {  /////////////////////////////////////
    console.log('GET_PARTICIPANT_status recu ChatGateway', data);
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
      console.log('Not a channel');
      retArray = [];
    }
    console.log('GET_CHANNEL_ADMINS recu ChatGateway', data);
    client.emit('get_channel_admins', { admins: retArray });
  }

  // -------------- ADD -------------

  @SubscribeMessage('CREATE_CHANNEL')
  async create_channel(client: Socket, data: { privacy: string, name: string, password: string, description: string, owner: string }) {
    this.logger.log('CREATE_CHANNEL recu ChatGateway with', data.name);
    const user = await this.usersService.getUserByUsername(data.owner);
    const channel: Channel = await this.channelsService.createChannel(user, data.name, data.password, data.description, data.privacy); // ADD MSG CHANNEL CREATED
    this.add_message(client, { sender: data.owner, receiver: data.name, content: "I joined" });
    this.get_all_conv_info(client, { sender: data.owner });
  }

  @SubscribeMessage('JOIN_CHANNEL')
  async join_channel(client: Socket, data: { login: string, channelName: string, channelPassword: string }) {
    await this.channelsService.joinChannel(data.login, data.channelName, data.channelPassword); // ADD MSG X JOINED THE CHANNEL, ADD THAT IF MSG EMPTY PERSON JOINING BECOMES ADMIN
    client.emit('channel_joined', { channelName: data.channelName });
    this.get_all_conv_info(client, { sender: data.login });
  }

  @SubscribeMessage('ADD_ADMIN')
  async add_admin(client: Socket, data: { new_admin: string, channel: string }) { /////////////////////////////////////
    let channel = await this.channelsService.getOneChannel(data.channel);
    await this.channelsService.addAdmin(data.new_admin, channel);
    console.log('ADD_ADMIN recu ChatGateway', data);
    // ADD NEW ADMIN IN DB OF channel
  }

  @SubscribeMessage('BAN_USER')
  async ban_user(client: Socket, data: { user: string, channel: string }) { /////////////////////////////////////
    console.log('BAN_USER recu ChatGateway', data);
    // ADD USER TO BAN_LIST
  }

  @SubscribeMessage('MUTE_USER')
  async mute_user(client: Socket, data: { user: string, channel: string }) {  /////////////////////////////////////
    console.log('MUTE_USER recu ChatGateway', data);
    // ADD USER TO MUTE_LIST
  }

  // -------------- PATCH -------------

  @SubscribeMessage('LEAVE_CHANNEL')
  async leave_channel(client: Socket, data: { login: string, channelName: string }) {
    await this.channelsService.leaveChannel(data.login, data.channelName);
    client.emit('channel_left', { channelName: data.channelName });
    this.get_all_conv_info(client, { sender: data.login });
  }

  @SubscribeMessage('CHANGE_CHANNEL_NAME')
  async change_channel_name(client: Socket, data: { login: string, currentName: string, newName: string }) {
    await this.channelsService.changeName(data.currentName, data.newName);
    this.logger.log('CHANGE_CHANNEL_NAME recu ChatGateway', data);
    // this.get_all_conv_info(client, { sender: data.login });
    this.get_all_channels(client, data.login);
  }

  @SubscribeMessage('CHANGE_CHANNEL_PASSWORD')
  async change_channel_password(client: Socket, data: { login: string, channelName: string, newPassword: string }) {
    this.logger.log('CHANGE_CHANNEL_PASSWORD recu ChatGateway', data);
    await this.channelsService.changePassword(data.channelName, data.newPassword); // ADD MSG PW CHANGED
    this.get_all_conv_info(client, { sender: data.login });
    this.get_all_channels(client, data.login);
  }

  @SubscribeMessage('CHANGE_CHANNEL_PRIVACY')
  async change_channel_privacy(client: Socket, data: { login: string, channel: string }) { /////////////////////////////////////
    this.logger.log('CHANGE_CHANNEL_PRIVACY recu ChatGateway', data);
  }

  @SubscribeMessage('REMOVE_ADMIN')
  async remove_admin(client: Socket, data: { admin: string, channel: string }) {  /////////////////////////////////////
    console.log('REMOVE_ADMIN recu ChatGateway', data);
    // REMOVE ADMIN IN DB OF channel
  }

  @SubscribeMessage('KICK_USER')
  async kick_user(client: Socket, data: { user: string, channel: string }) {  /////////////////////////////////////
    console.log('KICK_USER recu ChatGateway', data);
    // REMOVE USER FROM channel 
  }

}
