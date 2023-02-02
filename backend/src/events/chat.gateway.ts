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

const db_messages = Array<{
  index: number;
  sender: string;
  receiver: string;
  content: string;
  time: Date;
}>();
const db_blockList = Array<{
  index: number;
  loginBlock: string;
  loginEmitter: string;
}>();
const db_participants = Array<{
  index: number;
  login: string;
  channel: string;
  admin: boolean;
}>();
const db_channels = Array<{
  index: number;
  privacy: string;
  name: string;
  password: string;
  description: string;
  owner: string;
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

  @SubscribeMessage('ADD_MESSAGE')
  async add_message(client: Socket, data: { sender: string, receiver: string, content: string }) {
    let sender = await this.usersService.getUserByUsername(data.sender);
    let receiverUser = await this.usersService.getUserByUsername(data.receiver);
    let receiverChannel = await this.channelsService.getOneChannel(data.receiver);

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
    //     sender.socket.emit('new_message');
    //   }
    //   this.logger.log('send newMessage to', receiver.user.login);
    //   if (receiver != undefined) {
    //     receiver.socket.emit('new_message');
    //   }
    // }
    }

  @SubscribeMessage('CREATE_CHANNEL')
  async create_channel(client: Socket, data: { privacy: string, name: string, password: string, description: string, owner: string }) {
    this.logger.log('CREATE_CHANNEL recu ChatGateway with', data.name);
    const user = await this.usersService.getUserByUsername(data.owner);
    await this.channelsService.createChannel(user, data.name, data.password, data.description, data.privacy); // ADD MSG CHANNEL CREATED
    // this.get_all_conv_info(client, { sender: data.owner });
  }

  @SubscribeMessage('GET_ALL_CHANNELS')
  async get_all_channels(client: Socket, login: string) {
    this.logger.log('GET_ALL_CHANNELS recu ChatGateway with');
    const channels = await this.channelsService.getChannel();
    client.emit('get_all_channels', channels);
    this.logger.log('send get_all_channels to ', login, 'with', channels);
  }

  @SubscribeMessage('JOIN_CHANNEL')
  async join_channel(client: Socket, data: { login: string, channelName: string, channelPassword: string }) {
    await this.channelsService.joinChannel(data.login, data.channelName, data.channelPassword); // ADD MSG X JOINED THE CHANNEL, ADD THAT IF MSG EMPTY PERSON JOINING BECOMES ADMIN
    client.emit('channel_joined', { channelName: data.channelName });
    this.get_all_conv_info(client, { sender: data.login });
  }

  @SubscribeMessage('LEAVE_CHANNEL')
  async leave_channel(client: Socket, data: { login: string, channelName: string }) {
    await this.channelsService.leaveChannel(data.login, data.channelName);
    client.emit('channel_left', { channelName: data.channelName });
    this.get_all_conv_info(client, { sender: data.login });
  }

  @SubscribeMessage('GET_PARTICIPANTS')
  async get_participants(client: Socket, data: { login: string, channel: string }) {
    client.emit('get_participants', (await this.channelsService.getOneChannel(data.channel)).userConnected);
    this.logger.log('send get_participants to', data.login);
  }

  @SubscribeMessage('GET_PARTICIPANT_ROLE')
  get_participant_role(client: Socket, data: { login: string, channel: string }) {
    // console.log('GET_PARTICIPANT_ROLE recu ChatGateway', data);
    // let role: string;
    // db_channels.forEach((channel) => {
    //   // RETURN THE ROLE (ADMIN, OWNER OR PARTICIPANT), AS A STRING,  OF THE USER PASSED IN ARGS IN THE CHANNEL PASSED IN ARGS
    //   if (channel.name === data.channel) {
    //     if (channel.owner === data.login) {
    //       role = 'owner';
    //     } else {
    //       db_participants.forEach((participant) => {
    //         if (participant.login === data.login) {
    //           if (participant.channel === data.channel) {
    //             if (participant.admin) {
    //               role = 'admin';
    //             } else {
    //               role = 'participant';
    //             }
    //           }
    //         }
    //       });
    //     }
    //   }
    // });
    // client.emit('get_participant_role', { role: role });
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

  @SubscribeMessage('GET_CONV')
  async get_conv(client: Socket, data: { sender: string, receiver: string; }) {
    // const convers = await this.messagesService.findConvers(
    //   data.receiver,
    //   data.sender,
    // );
    // const channel = await this.channelsService.findChannel(data.receiver);
    // if (
    //   channel.length // IF RECEIVER IS A CHANNEL
    // ) {
    //   client.emit(
    //     'get_conv',
    //     await this.channelsService.getChannelMessages(data.receiver), // EMIT WITH ALL MESSAGES OF THIS CHANNEL (ALL MESSAGES WITH THE CHANNELNAME AS RECEIVER)
    //   );
    //   this.logger.log('send get_conv to front');
    // } else {
    //   // IF NOT A CHANNEL, THEN ITS A USER TO USER CONV
    //   client.emit('get_conv', convers);
    //   this.logger.log('send get_conv to front');
    // }
  }

  @SubscribeMessage('GET_ALL_CONV_INFO')
  async get_all_conv_info(client: Socket, data: { sender: string }) {
    // const messages = await this.messagesService.findAll();
    // const senderLogin = (await this.usersService.getUserByUsername(data.sender)).login;
    // // const channel = await this.channelsService.findChannel(data.receiver);
    // this.logger.log('GET_ALL_CONV_INFO recu ChatGateway', data);
    // const retArray = Array<{
    //   receiver: string;
    //   last_message_time: Date;
    //   last_message_text: string;
    //   new_conv: boolean;
    // }>();
    //
    // // WE'RE GONNA PUSH IN RETARRAY ALL THE CONV WHERE data.sender IS REGISTERED,
    // // WITH THOSE INFO : RECEIVER, TIME OF LAST MESSAGE, CONTENT OF LAST MESSAGE AND NEW_CONV AS FALSE
    // // (NEW_CONV IS USEFUL IN THE FRONT, DONT PAY ATTENTION TO IT)
    //
    // db_participants
    //   .filter((participant) => participant.login == senderLogin) // FIND ALL PARTICIPATIONS TO A CHANNEL OF THE USER IN ARGS
    //   .map((room) => {
    //     // FOR EACH OF THOSE PARTICIPATIONS
    //     const tmp = db_messages // FIND THE LAST MESSAGE SENT IN THIS CHANNEL
    //       .sort((a, b) => b.index - a.index)
    //       .find((message) => message.receiver == room.channel);
    //
    //     if (tmp != undefined) {
    //       // PUSH ALL INFO IN RETARRAY
    //       retArray.push({
    //         receiver: room.channel,
    //         last_message_time: tmp.time,
    //         last_message_text: tmp.content,
    //         new_conv: false,
    //       });
    //     }
    //   });
    //
    // messages
    //   .filter(
    //     (message) =>
    //       message.receiver == data.sender || message.sender == data.sender,
    //   ) // FIND ALL MESSAGES WHERE USER IN ARGS IS CONCERNED
    //   .map((messageItem) => {
    //     if (messageItem.sender == data.sender) {
    //       // IF USER IS SENDER ()
    //       if (
    //         retArray.find((item) => item.receiver == messageItem.receiver) ==
    //         undefined // IF THE CONV WITH THIS RECEIVER(messageItem.receiver) IS NOT IN RETARRAY YET
    //       ) {
    //         let tmp = messages.sort(
    //           (a, b) => a.date.getDate() - b.date.getDate(),
    //         ); // PUT IN TMP ALL MESSAGES SORTED (IN ORDER TO FIND THE LAST ONE)
    //         retArray.push({
    //           // PUSH INFO INTO RETARRAY WITH :
    //           receiver: messageItem.receiver,
    //           last_message_text: tmp // FIND THE LAST MESSAGE OF THIS CONV
    //             // (USER IS SENDER OR RECEIVER !AND! messageItem.receiver IS SENDER OR RECEIVER)
    //             .reverse()
    //             .find(
    //               (message) =>
    //                 (message.sender == data.sender &&
    //                   message.receiver == messageItem.receiver) ||
    //                 (message.receiver == data.sender &&
    //                   message.sender == messageItem.receiver),
    //             ).content, // TAKE THE CONTENT
    //           new_conv: false,
    //           last_message_time: tmp // SAME HERE BUT :
    //             .reverse()
    //             .find(
    //               (message) =>
    //                 (message.sender == data.sender &&
    //                   message.receiver == messageItem.receiver) ||
    //                 (message.receiver == data.sender &&
    //                   message.sender == messageItem.receiver),
    //             ).date, // TAKE THE TIME
    //         });
    //       }
    //     } else if (
    //       retArray.find((item) => item.receiver == messageItem.sender) == // IF USER IS THE RECEIVER
    //       undefined
    //     ) {
    //       let tmp = [
    //         ...messages.sort((a, b) => a.date.getDate() - b.date.getDate()),
    //       ];
    //       console.log('tmp time', tmp[0].date); // SAME THING HERE
    //       retArray.push({
    //         receiver: messageItem.sender,
    //         last_message_text: tmp
    //           .reverse()
    //           .find(
    //             (message) =>
    //               (message.sender == data.sender &&
    //                 message.receiver == messageItem.sender) ||
    //               (message.receiver == data.sender &&
    //                 message.sender == messageItem.sender),
    //           ).content,
    //         new_conv: false,
    //         last_message_time: tmp
    //           .reverse()
    //           .find(
    //             (message) =>
    //               (message.sender == data.sender &&
    //                 message.receiver == messageItem.sender) ||
    //               (message.receiver == data.sender &&
    //                 message.sender == messageItem.sender),
    //           ).date,
    //       });
    //     } else {
    //       console.log(messageItem);
    //     }
    //   });
    // console.log(retArray);
    //
    // client.emit('get_all_conv_info', retArray);
    // this.logger.log('send get_all_conv_info to front', retArray);
  }

  @SubscribeMessage('ADD_USER')
  add_user(client: Socket, data: { login: string }) {
    console.log('ADD_USER recu EventGateway', data); // NE RIEN FAIRE POUR L'INSTANT
    // users.push({
    //   index: users.length,
    //   login: data.login,
    //   socket: client,
    // });
  }

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

    // users.push({ index: users.length, user: {}, socket: client });
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`client ${client.id} disconnected`);
    // users.splice(
    //   users.findIndex((item) => item.socket.id == client.id),
    //   1,
    // );
  }
}
