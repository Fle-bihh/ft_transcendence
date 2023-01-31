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
import { channel } from 'diagnostics_channel';
import { any } from '@hapi/joi';
import { Repository } from 'typeorm';
import { Message } from 'src/entities/message.entity';
import { MessagesDto } from 'src/channel/dto/messages.dto';
import { ChannelsDto } from 'src/channel/dto/messages.dto';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelService } from 'src/channel/channel.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users/users.service';

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
const db_muteList = Array<{
  index: number;
  login: string;
  channel: string;
  muteDate: Date;
}>();
const db_banList = Array<{
  index: number;
  login: string;
  channel: string;
  banDate: Date;
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
const users = Array<{ index: number; login: string; socket: Socket }>();

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
  ) {}

  @WebSocketServer()
  httpServer = createServer();
  io = new Server(this.httpServer);

  @SubscribeMessage('CONNECT')
  connect() {
    this.logger.log('connected serverside');
  }

  @SubscribeMessage('ADD_MESSAGE')
  async add_message(
    client: Socket,
    data: {
      sender: string;
      receiver: string;
      content: string;
    },
  ) {
    if (
      db_blockList.find(
        // VERIFIER QUE LE USER EST PAS BLOCK, A VOIR PLUS TARD SI TU VEUX QU ON CHANGE LA METHODE DE BLOCKLIST
        (block) =>
          block.loginBlock === data.sender &&
          block.loginEmitter === data.receiver,
      )
    ) {
      return;
    }
    const actualTime: Date = new Date();
    const messageDto: MessagesDto = {
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
      date: actualTime,
    };
    console.log(messageDto);

    this.messagesService.addMessage(messageDto);
    this.logger.log('ADD_MESSAGE recu ChatGateway');

    const channels = await this.channelsService.getAllChannels();

    if (channels.find((channel) => channel.name == data.receiver)) {
      // A VOIR APRES SI CA SERT ENCORE D'ENVOYER CA
      db_participants
        .filter((participant) => participant.channel == data.receiver)
        .map((participant) => {
          let tmp = users.find((user) => user.login == participant.login);
          if (tmp != undefined) tmp.socket.emit('new_message');
        });
    } else {
      let senderUser = this.usersService.getUserByLogin(data.sender);
      let receiverUser = this.usersService.getUserByLogin(data.receiver);

      let senderSocket = users.find(user => {
        user.login === data.sender
      }).socket;
      let receiverSocket = users.find(user => {
        user.login === data.receiver
      }).socket;

      if (senderSocket != undefined) senderSocket.emit('new_message');
      if (receiverSocket != undefined) receiverSocket.emit('new_message');
    }
  }

  @SubscribeMessage('CREATE_CHANNEL')
  create_channel(
    client: Socket,
    data: {
      privacy: string;
      name: string;
      password: string;
      description: string;
      owner: string;
    },
  ) {
    this.logger.log('CREATE_CHANNEL recu ChatGateway with', data); // PUSH NEW CHANNEL INTO DB
    const channelsDto: ChannelsDto = {
      name: data.name,
      privacy: data.privacy,
      description: data.description,
      password: data.password,
      owner: data.owner,
    };
    this.channelsService.addChannel(channelsDto);
    // PUSH NEW PARTICIPANT INTO DB
    db_participants.push({
      index: db_participants.length,
      login: data.owner,
      channel: data.name,
      admin: true,
    });
    const actualTime: Date = new Date();

    const messageDto: MessagesDto = {
      sender: '___server___',
      receiver: data.name,
      content: `${data.owner} created channel`,
      date: actualTime,
    };

    this.messagesService.addMessage(messageDto);
    this.get_all_conv_info(client, { sender: data.owner });
  }

  @SubscribeMessage('GET_ALL_CHANNELS')
  async get_all_channels(client: Socket, login: string) {
    this.logger.log('GET_ALL_CHANNELS recu ChatGateway with');
    const channels = await this.channelsService.getAllChannels();
    client.emit('get_all_channels', channels);
    this.logger.log('send get_all_channels to ', login, 'with', channels);
  }

  @SubscribeMessage('JOIN_CHANNEL')
  async join_channel(
    client: Socket,
    data: {
      login: string;
      channelName: string;
      channelPassword: string;
    },
  ) {
    const channel = await this.channelsService.findChannel(data.channelName);
    if (
      channel // IF THE CHANNEL NAME IN ARG EXISTS
    ) {
      if (
        // IF CHANNEL PARTICIPANTS LENGTH > 0 && < 50
        db_participants.filter((item) => item.channel == data.channelName)
          .length < 50 &&
        db_participants.filter((item) => item.channel == data.channelName)
          .length > 0
      ) {
        if (
          // IF THE LOGIN NAME ISNT ALREADY REGISTERED IN THIS CHANNEL
          db_participants.find(
            (item) =>
              item.login == data.login && item.channel == data.channelName,
          ) == undefined
        ) {
          if (
            // IF THE PASSWORD IS RIGHT
            db_channels.find((item) => item.name == data.channelName)
              .password == data.channelPassword
          ) {
            db_participants.push({
              // PUSH NEW PARTICIPANT AS NON_ADMIN
              index: db_participants.length,
              login: data.login,
              channel: data.channelName,
              admin: false,
            });
            const actualTime: Date = new Date();
            const messageDto: MessagesDto = {
              sender: '___server___',
              receiver: data.channelName,
              content: `${data.login} joined \'${data.channelName}\'`,
              date: actualTime,
            };
            client.emit('channel_joined', {
              channelName: data.channelName,
            });

            this.get_all_conv_info(client, { sender: data.login });
          }
        }
      } else if (
        db_participants.filter((item) => item.channel == data.channelName) // IF NO PARTICIPANTS
          .length === 0
      ) {
        if (
          db_channels.find((item) => item.name == data.channelName).password == // IF PASSWORD IS RIGHT
          data.channelPassword
        ) {
          db_participants.push({
            // PUSH NEW PARTICIPANT AS ADMIN
            index: db_participants.length,
            login: data.login,
            channel: data.channelName,
            admin: true,
          });
          const actualTime: Date = new Date();
          const messageDto: MessagesDto = {
            sender: '___server___',
            receiver: data.channelName,
            content: `${data.login} joined \'${data.channelName}\'`,
            date: actualTime,
          };
          db_channels.forEach((channel) => {
            // UPDATE THE OWNER OF THIS CHANNEL AS THE USER ASKING THIS REQUEST
            if (channel.name === data.channelName) {
              channel.owner = data.login;
            }
          });
          client.emit('channel_joined', {
            channelName: data.channelName,
          });

          this.get_all_conv_info(client, { sender: data.login });
        }
      }
    }
  }

  @SubscribeMessage('LEAVE_CHANNEL')
  leave_channel(
    client: Socket,
    data: {
      login: string;
      channelName: string;
    },
  ) {
    let index = -1;
    db_participants.forEach((participant) => {
      // SEARCH INTO PARTICIPANTS DB
      index++;
      if (
        // IF CHANNEL PASSED IN ARGS EXISTS AND USER REQUESTING IS REGISTERED AS PARTICIPANT
        participant.login === data.login &&
        participant.channel === data.channelName
      ) {
        db_participants.splice(index, 1); // DELETE PARTICIPANT FROM THIS CHANNEL
        const actualTime: Date = new Date();
        const messageDto: MessagesDto = {
          sender: '___server___',
          receiver: data.channelName,
          content: `${data.login} left \'${data.channelName}\'`,
          date: actualTime,
        };

        client.emit('channel_left', {
          channelName: data.channelName,
        });

        this.get_all_conv_info(client, { sender: data.login });
      }
    });
  }

  @SubscribeMessage('GET_PARTICIPANTS')
  get_participants(
    client: Socket,
    data: {
      login: string;
      channel: string;
    },
  ) {
    this.logger.log('GET_PARTICIPANTS received in back with', data);
    let tmpArray = Array<{
      login: string;
      admin: boolean;
    }>();
    db_participants.forEach((participant) => {
      // GET ALL PARTICIPANTS OF THE CHANNEL PASSED IN ARGS
      if (participant.channel === data.channel) {
        tmpArray.push({
          login: participant.login,
          admin: participant.admin,
        });
      }
    });
    client.emit('get_participants', tmpArray);
    this.logger.log('send get_participants to', data.login);
  }

  @SubscribeMessage('GET_PARTICIPANT_ROLE')
  get_participant_role(
    client: Socket,
    data: {
      login: string;
      channel: string;
    },
  ) {
    console.log('GET_PARTICIPANT_ROLE recu ChatGateway', data);
    let role: string;
    db_channels.forEach((channel) => {
      // RETURN THE ROLE (ADMIN, OWNER OR PARTICIPANT), AS A STRING,  OF THE USER PASSED IN ARGS IN THE CHANNEL PASSED IN ARGS
      if (channel.name === data.channel) {
        if (channel.owner === data.login) {
          role = 'owner';
        } else {
          db_participants.forEach((participant) => {
            if (participant.login === data.login) {
              if (participant.channel === data.channel) {
                if (participant.admin) {
                  role = 'admin';
                } else {
                  role = 'participant';
                }
              }
            }
          });
        }
      }
    });
    client.emit('get_participant_role', { role: role });
  }

  @SubscribeMessage('CHANGE_CHANNEL_NAME')
  async change_channel_name(
    client: Socket,
    data: {
      login: string;
      currentName: string;
      newName: string;
    },
  ) {
    const messages = await this.messagesService.findAll();
    const channels = await this.channelsService.getAllChannels();
    this.logger.log('CHANGE_CHANNEL_NAME recu ChatGateway', data);
    db_channels.forEach((channel) => {
      // CHANGE THE CHANNEL NAME INTO CHANNEL DB WITH NEWNAME
      if (channel.name === data.currentName) {
        channel.name = data.newName;
      }
    });
    db_participants.forEach((participant) => {
      // CHANGE THE CHANNELNAME OF ALL PARTICIPANTS OF THIS CHANNEL IN DB PARTICIPANTS WITH NEWNAME
      if (participant.channel === data.currentName) {
        participant.channel = data.newName;
      }
    });
    messages.forEach((message) => {
      // CHANGE THE RECEIVER_STRING OF ALL MESSAGES OF THIS CHANNEL (IF CHANNEL MESSAGE : RECEIVER = CHANNEL NAME) WITH NEW_NAME
      if (message.receiver === data.currentName) {
        message.receiver = data.newName;
      }
    });
    const actualTime: Date = new Date();
    const messageDto: MessagesDto = {
      sender: '___server___',
      receiver: data.newName,
      content: `${data.login} changed the channel name to \'${data.newName}\'`,
      date: actualTime,
    };
    this.get_all_conv_info(client, { sender: data.login });
    this.get_all_channels(client, data.login);
  }

  @SubscribeMessage('CHANGE_CHANNEL_PASSWORD')
  change_channel_password(
    client: Socket,
    data: {
      login: string;
      channelName: string;
      newPassword: string;
    },
  ) {
    this.logger.log('CHANGE_CHANNEL_PASSWORD recu ChatGateway', data);
    db_channels.forEach((channel) => {
      // CHANGE THE PASSWORD OF THE CHANNEL IN CHANNEL_DB WITH newPassword
      if (channel.name === data.channelName) {
        channel.password = data.newPassword;
      }
    });
    const actualTime: Date = new Date();
    const messageDto: MessagesDto = {
      sender: '___server___',
      receiver: data.channelName,
      content: `${data.login} changed the channel password'`,
      date: actualTime,
    };
    this.get_all_conv_info(client, { sender: data.login });
    this.get_all_channels(client, data.login);
  }

  @SubscribeMessage('GET_CONV')
  async get_conv(
    client: Socket,
    data: {
      sender: string;
      receiver: string;
    },
  ) {
    const convers = await this.messagesService.findConvers(
      data.receiver,
      data.sender,
    );
    const channel = await this.channelsService.findChannel(data.receiver);
    if (
      channel.length // IF RECEIVER IS A CHANNEL
    ) {
      client.emit(
        'get_conv',
        (await this.channelsService.getChannelMessages(data.receiver)), // EMIT WITH ALL MESSAGES OF THIS CHANNEL (ALL MESSAGES WITH THE CHANNELNAME AS RECEIVER)
      );
      this.logger.log('send get_conv to front');
    } else {
      // IF NOT A CHANNEL, THEN ITS A USER TO USER CONV
      client.emit('get_conv', convers);
      this.logger.log('send get_conv to front');
    }
  }

  @SubscribeMessage('GET_ALL_CONV_INFO')
  async get_all_conv_info(
    client: Socket,
    data: {
      sender: string;
    },
  ) {
    const messages = await this.messagesService.findAll();
    // const channel = await this.channelsService.findChannel(data.receiver);
    this.logger.log('GET_ALL_CONV_INFO recu ChatGateway', data);
    const retArray = Array<{
      receiver: string;
      last_message_time: Date;
      last_message_text: string;
      new_conv: boolean;
    }>();

    // WE'RE GONNA PUSH IN RETARRAY ALL THE CONV WHERE data.sender IS REGISTERED,
    // WITH THOSE INFO : RECEIVER, TIME OF LAST MESSAGE, CONTENT OF LAST MESSAGE AND NEW_CONV AS FALSE
    // (NEW_CONV IS USEFUL IN THE FRONT, DONT PAY ATTENTION TO IT)

    db_participants
      .filter((participant) => participant.login == data.sender) // FIND ALL PARTICIPATIONS TO A CHANNEL OF THE USER IN ARGS
      .map((room) => {
        // FOR EACH OF THOSE PARTICIPATIONS
        const tmp = db_messages // FIND THE LAST MESSAGE SENT IN THIS CHANNEL
          .sort((a, b) => b.index - a.index)
          .find((message) => message.receiver == room.channel);

        if (tmp != undefined) {
          // PUSH ALL INFO IN RETARRAY
          retArray.push({
            receiver: room.channel,
            last_message_time: tmp.time,
            last_message_text: tmp.content,
            new_conv: false,
          });
        }
      });

    messages
      .filter(
        (message) =>
          message.receiver == data.sender || message.sender == data.sender,
      ) // FIND ALL MESSAGES WHERE USER IN ARGS IS CONCERNED
      .map((messageItem) => {
        if (messageItem.sender == data.sender) {
          // IF USER IS SENDER ()
          if (
            retArray.find((item) => item.receiver == messageItem.receiver) ==
            undefined // IF THE CONV WITH THIS RECEIVER(messageItem.receiver) IS NOT IN RETARRAY YET
          ) {
            let tmp = messages.sort((a, b) => a.date.getDate() - b.date.getDate()); // PUT IN TMP ALL MESSAGES SORTED (IN ORDER TO FIND THE LAST ONE)
            retArray.push({
              // PUSH INFO INTO RETARRAY WITH :
              receiver: messageItem.receiver,
              last_message_text: tmp // FIND THE LAST MESSAGE OF THIS CONV
                // (USER IS SENDER OR RECEIVER !AND! messageItem.receiver IS SENDER OR RECEIVER)
                .reverse()
                .find(
                  (message) =>
                    (message.sender == data.sender &&
                      message.receiver == messageItem.receiver) ||
                    (message.receiver == data.sender &&
                      message.sender == messageItem.receiver),
                ).content, // TAKE THE CONTENT
              new_conv: false,
              last_message_time: tmp // SAME HERE BUT :
                .reverse()
                .find(
                  (message) =>
                    (message.sender == data.sender &&
                      message.receiver == messageItem.receiver) ||
                    (message.receiver == data.sender &&
                      message.sender == messageItem.receiver),
                ).date, // TAKE THE TIME
            });
          }
        } else if (
          retArray.find((item) => item.receiver == messageItem.sender) == // IF USER IS THE RECEIVER
          undefined
        ) {
          let tmp = [...messages.sort((a, b) => a.date.getDate() - b.date.getDate())];
          console.log('tmp time', tmp[0].date); // SAME THING HERE
          retArray.push({
            receiver: messageItem.sender,
            last_message_text: tmp
              .reverse()
              .find(
                (message) =>
                  (message.sender == data.sender &&
                    message.receiver == messageItem.sender) ||
                  (message.receiver == data.sender &&
                    message.sender == messageItem.sender),
              ).content,
            new_conv: false,
            last_message_time: tmp
              .reverse()
              .find(
                (message) =>
                  (message.sender == data.sender &&
                    message.receiver == messageItem.sender) ||
                  (message.receiver == data.sender &&
                    message.sender == messageItem.sender),
              ).date,
          });
        } else {
          console.log(messageItem);
        }
      });
    console.log(retArray);

    client.emit('get_all_conv_info', retArray);
    this.logger.log('send get_all_conv_info to front', retArray);
  }

  @SubscribeMessage('ADD_USER')
  add_user(
    client: Socket,
    data: {
      login: string;
    },
  ) {
    console.log('ADD_USER recu ChatGateway', data);
    users.push({
      index: users.length,
      login: data.login,
      socket: client,
    });
  }

  @SubscribeMessage('BLOCK_USER')
  block_user(
    client: Socket,
    data: {
      login: string;
      target: string;
    },
  ) {
    console.log('BLOCK_USER recu ChatGateway', data);
    this.logger.log('db_block = ', db_blockList);
    if (
      db_blockList.find(
        (block) =>
          block.loginBlock === data.target && block.loginEmitter === data.login,
      )
    )
      return;
    db_blockList.push({
      index: users.length,
      loginBlock: data.target,
      loginEmitter: data.login,
    });
  }

  @SubscribeMessage('UPDATE_USER_SOCKET')
  update_user_socket(
    client: Socket,
    data: {
      login: string;
    },
  ) {
    if (users.findIndex((user) => user.login === data.login) >= 0) {
      users[users.findIndex((user) => user.login === data.login)].socket =
        client;
    }
    this.logger.log('UPDATE_USER_SOCKET recu ChatGateway');
  }

  handleConnection(client: Socket) {
    // this.logger.log(`new client connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`client ${client.id} disconnected`);
    // users.splice
  }
}
