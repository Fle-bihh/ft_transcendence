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
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/user.entity';

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

  constructor(private userService: UsersService) {}

  @WebSocketServer()
  httpServer = createServer();
  io = new Server(this.httpServer);

  @SubscribeMessage('CONNECT')
  connect() {
    this.logger.log('connected serverside');
  }

  @SubscribeMessage('CHECK_USER_EXIST')
  async check_user_exist(client: Socket, userLogin: string) {
    this.logger.log(db_users);
    this.userService
      .getUserByLogin(userLogin)
      .then(() => {
        client.emit('check_user_exist', true);
      })
      .catch(() => {
        client.emit('check_user_exist', false);
      });
  }

  @SubscribeMessage('ADD_USER')
  add_user(
    client: Socket,
    data: {
      login: string;
    },
  ) {
    console.log('ADD_USER recu EventGateway', data); // NE RIEN FAIRE POUR L'INSTANT
    users.push({
      index: users.length,
      login: data.login,
      socket: client,
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
      users[users.findIndex((user) => user.login === data.login)].socket = // NE RIEN FAIRE POUR L'INSTANT
        client;
    }
    this.logger.log('UPDATE_USER_SOCKET recu EventGateway');
  }

  @SubscribeMessage('GET_ALL_USERS')
  async get_all_users(client: Socket, login: string) {
    this.logger.log('GET_ALL_USERS received back');
    const retArray = Array<{ id: string; username: string }>();
    const user = await this.userService.getAll();
    user.map((user) => {
      retArray.push({
        id: user.id,
        username: user.username,
      });
    });
    client.emit('get_all_users', retArray);
    this.logger.log('send get_all_users to front', retArray);
  }

  @SubscribeMessage('ADD_FRIENDSHIP')
  add_friendship(
    client: Socket, // RIEN POUR L INSTANT
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
  async get_user_friends(client: Socket, login: string) {
    this.logger.log('GET_USER_FRIENDS received in backend from', login);
    let tmpArray = Array<{
      login: string;
      login2: string;
      friendshipDate: Date;
    }>();
    const friends = await this.userService.getFriends(login);
    // db_friendList.map((friend) => {                                 // IL FAUT ENVOYER TOUS LES FRIENDS DU login RECU EN ARG, TU PEUX UTILISER TA FONCTION MANY DU COUP
    //   if (friend.login === login || friend.login2 === login) {
    //     tmpArray.push({
    //       login: friend.login,
    //       login2: friend.login2,
    //       friendshipDate: friend.friendshipDate,
    //     });
    //   }
    // });
    client.emit('get_user_friends', friends);
    this.logger.log('send get_user_friends to ', login, 'with', friends);
  }

  handleConnection(client: Socket) {
    this.logger.log(`new client connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`client ${client.id} disconnected`);
  }
}
