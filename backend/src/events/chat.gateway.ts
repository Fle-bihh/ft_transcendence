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
import {Repository} from 'typeorm';
import {Message} from 'src/entities/message.entity';
import {MessagesDto} from 'src/channel/dto/messages.dto';
import {User} from 'src/entities/user.entity';
import {InjectRepository} from '@nestjs/typeorm';

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
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  @WebSocketServer()
  httpServer = createServer();
  io = new Server(this.httpServer);

  @SubscribeMessage('CONNECT')
  connect() {
    this.logger.log('connected serverside');
  }

  @SubscribeMessage('ADD_MESSAGE')
  add_message(
    client: Socket,
    data: {
      sender: string;
      receiver: string;
      content: string;
    },
  ) {
    if (
      db_blockList.find(
        (block) =>
          block.loginBlock === data.sender &&
          block.loginEmitter === data.receiver,
      )
    ) {
      return;
    }
    const actualTime: Date = new Date();
    const messageDto: MessagesDto = {
      // id: db_messages.length,
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
      date: actualTime,
    }
    console.log(messageDto);
    this.messageRepository.save(messageDto);
    // db_messages.push({
    //   index: db_messages.length,
    //   sender: data.sender,
    //   receiver: data.receiver,
    //   content: data.content,
    //   time: actualTime,
    // });

    this.logger.log('ADD_MESSAGE recu ChatGateway');

    // this.get_all_conv_info(client, { sender: data.sender });

    if (db_channels.find((channel) => channel.name == data.receiver)) {
      db_participants
        .filter((participant) => participant.channel == data.receiver)
        .map((participant) => {
          let tmp = users.find((user) => user.login == participant.login);
          if (tmp != undefined) tmp.socket.emit('new_message');
        });
    } else {
      let senderUser = users.find((user) => user.login == data.sender);
      let receiverUser = users.find((user) => user.login == data.receiver);

      if (senderUser != undefined) senderUser.socket.emit('new_message');
      if (receiverUser != undefined) receiverUser.socket.emit('new_message');
      // if (receiverUser != undefined) receiverUser.socket.emit('add_notif', {type: 'FRIENDREQUEST', data: {sender: 'Leo'}});
    }

    //   if (db_channels.find((channel) => channel.name === data.receiver)) {
    //     db_participants
    //       .filter((participant) => participant.channel === data.receiver)
    //       .map((target) => {
    //         users
    //           .find((user) => user.login === target.login)
    //           .socket.emit('new_message');
    //         this.logger.log('send new_message to front', data.receiver);
    //       });
    //   } else {
    //     users
    //       .find((user) => user.login === data.receiver)
    //       .socket.emit('new_message');
    //     this.logger.log('send new_message to front', data.receiver);
    //   }
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

  @SubscribeMessage('GET_ALL_CHANNELS')
  get_all_channels(client: Socket, login: string) {
    this.logger.log('GET_ALL_CHANNELS recu ChatGateway with');
    let sendArray = Array<{
      index: number;
      privacy: string;
      name: string;
      password: string;
      description: string;
      owner: string;
    }>();
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

  @SubscribeMessage('JOIN_CHANNEL')
  join_channel(
    client: Socket,
    data: {
      login: string;
      channelName: string;
      channelPassword: string;
    },
  ) {
    if (
      db_channels.find((item) => item.name == data.channelName) != undefined
    ) {
      if (
        db_participants.filter((item) => item.channel == data.channelName)
          .length < 50 &&
        db_participants.filter((item) => item.channel == data.channelName)
          .length > 0
      ) {
        if (
          db_participants.find(
            (item) =>
              item.login == data.login && item.channel == data.channelName,
          ) == undefined
        ) {
          if (
            db_channels.find((item) => item.name == data.channelName)
              .password == data.channelPassword
          ) {
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
      } else if (
        db_participants.filter((item) => item.channel == data.channelName)
          .length === 0
      ) {
        if (
          db_channels.find((item) => item.name == data.channelName).password ==
          data.channelPassword
        ) {
          db_participants.push({
            index: db_participants.length,
            login: data.login,
            channel: data.channelName,
            admin: true,
          });
          db_messages.push({
            index: db_messages.length,
            sender: '___server___',
            receiver: data.channelName,
            content: `${data.login} joined \'${data.channelName}\'`,
            time: new Date(),
          });
          db_channels.forEach((channel) => {
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
      index++;
      if (
        participant.login === data.login &&
        participant.channel === data.channelName
      ) {
        db_participants.splice(index, 1);
        db_messages.push({
          index: db_messages.length,
          sender: '___server___',
          receiver: data.channelName,
          content: `${data.login} left \'${data.channelName}\'`,
          time: new Date(),
        });

        client.emit('channel_left', {
          channelName: data.channelName,
        });

        this.get_all_conv_info(client, { sender: data.login });
      }
    });
  }

  @SubscribeMessage('ADD_PARTICIPANT')
  add_participant(
    client: Socket,
    data: {
      login: string;
      channel: string;
      admin: boolean;
    },
  ) {
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
        if (tmp != undefined) tmp.socket.emit('new_message');
      });

    console.log('db_participants after ADD = ', db_participants);
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
  change_channel_name(
    client: Socket,
    data: {
      login: string;
      currentName: string;
      newName: string;
    },
  ) {
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

  @SubscribeMessage('GET_CHANNEL')
  get_channel(
    client: Socket,
    data: {
      sender: string;
      receiver: string;
    },
  ) {
    this.logger.log('GET_CHANNEL recu ChatGateway', data);

    client.emit(
      'get_conv',
      db_messages
        .sort((a, b) => a.index - b.index)
        .filter((message) => message.receiver == data.receiver),
    );
    this.logger.log(
      'send get_conv to front',
      db_messages
        .sort((a, b) => a.index - b.index)
        .filter((message) => message.receiver == data.receiver),
    );
  }

  @SubscribeMessage('GET_CONV')
  get_conv(
    client: Socket,
    data: {
      sender: string;
      receiver: string;
    },
  ) {
    if (
      db_channels.find((channel) => channel.name == data.receiver) != undefined
    ) {
      client.emit(
        'get_conv',
        db_messages
          .sort((a, b) => a.index - b.index)
          .filter((message) => message.receiver === data.receiver),
      );
      this.logger.log('send get_conv to front');
    } else {
      client.emit(
        'get_conv',
        db_messages
          .sort((a, b) => a.index - b.index)
          .filter(
            (message) =>
              (message.sender == data.sender &&
                message.receiver == data.receiver) ||
              (message.sender == data.receiver &&
                message.receiver == data.sender),
          ),
      );
      this.logger.log(
        'send get_conv to front',
        db_messages
          .sort((a, b) => a.index - b.index)
          .filter(
            (message) =>
              (message.sender == data.sender &&
                message.receiver == data.receiver) ||
              (message.sender == data.receiver &&
                message.receiver == data.sender),
          ),
      );
    }
  }

  @SubscribeMessage('GET_ALL_CONV_INFO')
  get_all_conv_info(
    client: Socket,
    data: {
      sender: string;
    },
  ) {
    this.logger.log('GET_ALL_CONV_INFO recu ChatGateway', data);
    const retArray = Array<{
      receiver: string;
      last_message_time: Date;
      last_message_text: string;
      new_conv: boolean;
    }>();

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
      .filter(
        (message) =>
          message.receiver == data.sender || message.sender == data.sender,
      ) // messages avec sender
      .map((messageItem) => {
        if (messageItem.sender == data.sender) {
          // si je suis sender
          if (
            retArray.find((item) => item.receiver == messageItem.receiver) ==
            undefined
          ) {
            // si retArray n'a pas encore la conv avec ce receiver
            let tmp = db_messages.sort((a, b) => a.index - b.index);
            retArray.push({
              receiver: messageItem.receiver,
              last_message_text: tmp
                .reverse()
                .find(
                  (message) =>
                    (message.sender == data.sender &&
                      message.receiver == messageItem.receiver) ||
                    (message.receiver == data.sender &&
                      message.sender == messageItem.receiver),
                ).content,
              new_conv: false,
              last_message_time: tmp
                .reverse()
                .find(
                  (message) =>
                    (message.sender == data.sender &&
                      message.receiver == messageItem.receiver) ||
                    (message.receiver == data.sender &&
                      message.sender == messageItem.receiver),
                ).time,
            });
          }
        } else if (
          retArray.find((item) => item.receiver == messageItem.sender) ==
          undefined
        ) {
          let tmp = [...db_messages.sort((a, b) => a.index - b.index)];
          console.log('tmp time', tmp[0].time);
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
              ).time,
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
