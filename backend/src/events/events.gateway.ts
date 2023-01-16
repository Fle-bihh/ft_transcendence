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

const db_users = Array<{
  index: number;
  login: string;
  password: string;
  username: string;
}>();
const db_friendList = Array<{
  index: number;
  login: string;
  login2: string;
  friendshipDate: Date;
}>();
const users = Array<{ index: number; login: string; socket: Socket }>();

@WebSocketGateway({
  cors: {
    origin: '*', // on accepte les requetes venant de partout
  },
})
export class EventsGateway {
  private logger: Logger = new Logger('AppGateway');

  @WebSocketServer()
  httpServer = createServer();
  io = new Server(this.httpServer);

  @SubscribeMessage('CONNECT')
  connect() {
    this.logger.log('connected serverside');
  }

  @SubscribeMessage('CHECK_USER_EXIST')
  check_user_exist(client: Socket, userLogin: string) {
    this.logger.log(db_users);
    client.emit(
      'check_user_exist',
      db_users.find((user) => user.login == userLogin) != undefined,
    );
  }

  @SubscribeMessage('ADD_USER')
  add_user(
    client: Socket,
    data: {
      login: string;
    },
  ) {
    console.log('ADD_USER recu EventGateway', data);
    users.push({
      index: users.length,
      login: data.login,
      socket: client,
    });
    // PUSH USER DATA INTO DB
    if (!db_users.find((user) => user.login == data.login))
      db_users.push({
        index: users.length,
        login: data.login,
        password: '',
        username: data.login,
      });
    // users.map((user) => {
    //   this.get_all_users(user.socket);
    // });
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
    this.logger.log('UPDATE_USER_SOCKET recu EventGateway');
  }

  @SubscribeMessage('GET_USERNAME')
  get_username(client: Socket, login: string) {
    this.logger.log('GET_USERNAME received back');

    client.emit(
      'get_username',
      db_users.find((user) => {
        user.login === login;
      }).username,
    );
    this.logger.log(
      'send get_username to ', login , ' with',
      db_users.find((user) => {
        user.login === login;
      }).username,
    );
  }

  @SubscribeMessage('GET_ALL_USERS')
  get_all_users(client: Socket) {
    this.logger.log('GET_ALL_USERS received back');
    const retArray = Array<{ id: number; login: string; username: string }>();
    db_users.map((user) => {
      retArray.push({
        id: user.index,
        login: user.login,
      });
    });
    client.emit('get_all_users', retArray);
    this.logger.log('send get_all_users to front', retArray);
  }

  @SubscribeMessage('ADD_FRIENDSHIP')
  add_friendship(
    client: Socket,
    data: {
      login: string;
      login2: string;
    },
  ) {
    this.logger.log('ADD_FRIENDSHIP received in backend');
    let tmpDate = new Date();
    db_friendList.push({
      index: db_friendList.length,
      login: data.login,
      login2: data.login2,
      friendshipDate: tmpDate,
    });
  }

  // @SubscribeMessage('FRIEND_REQUEST')
  // friend_request(client: Socket, data: {
  //   login: string;
  //   target: string;
  // }) {

  // }

  @SubscribeMessage('GET_USER_FRIENDS')
  get_user_friends(client: Socket, login: string) {
    this.logger.log('GET_USER_FRIENDS received in backend from', login);
    let tmpArray = Array<{
      login: string;
      login2: string;
      friendshipDate: Date;
    }>();
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

  handleConnection(client: Socket) {
    this.logger.log(`new client connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`client ${client.id} disconnected`);
  }
}
