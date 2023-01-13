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
const messages = Array<{
  index: number;
  sender: string;
  receiver: string;
  content: string;
  time: Date;
}>();

@WebSocketGateway({
  cors: {
    origin: '*', // on accepte les requetes venant de partout
  },
})
export class ChatGateway {
  private logger: Logger = new Logger('AppGateway');

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
    if (db_blockList.find(block => block.loginBlock === data.sender && block.loginEmitter === data.receiver)) {console.log('testest'); return;}
    const actualTime: Date = new Date();
    db_messages.push({
      index: db_messages.length,
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
      time: actualTime,
    });
    messages.push({
      index: db_messages.length,
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
      time: actualTime,
    });
    this.logger.log('ADD_MESSAGE recu ChatGateway');

    this.get_all_conv_info(client, { sender: data.sender });
    if (db_channels.find((channel) => channel.name === data.receiver)) {
      db_participants
        .filter((participant) => participant.channel === data.receiver)
        .map((target) => {
          users
            .find((user) => user.login === target.login)
            .socket.emit('new_message');
          this.logger.log('send new_message to front', data.receiver);
        });
    } else {
      users
        .find((user) => user.login === data.receiver)
        .socket.emit('new_message');
      this.logger.log('send new_message to front', data.receiver);
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
    this.logger.log('CREATE_CHANNEL recu ChatGateway with', data.name);
    db_channels.push({
      index: db_channels.length,
      privacy: 'public',
      name: data.name,
      password: data.password,
      description: data.description,
      owner: data.owner,
    });
    this.logger.log('db_channels after CREAT_CHANNEL = ', db_channels);
    db_participants.push({
      index: db_participants.length,
      login: data.owner,
      channel: data.name,
      admin: true,
    });
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
    console.log('db_participants after ADD = ', db_participants);
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
      messages
        .sort((a, b) => a.index - b.index)
        .filter((message) => message.receiver == data.receiver),
    );
    this.logger.log(
      'send get_conv to front',
      messages
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
    this.logger.log('GET_CONV recu ChatGateway', data);

    client.emit(
      'get_conv',
      messages
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
      messages
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

    messages
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
            let tmp = messages.sort((a, b) => a.index - b.index);
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
        } else {
          if (
            retArray.find((item) => item.receiver == messageItem.sender) ==
            undefined
          ) {
            let tmp = [...messages.sort((a, b) => a.index - b.index)];
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
          }
        }
      });
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
    this.logger.log('db_block = ', db_blockList)
    if (db_blockList.find(block => block.loginBlock === data.target && block.loginEmitter === data.login)) return;
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
  }
}
