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
import { FriendRequestService } from 'src/friends/friendRequest.service';
import { FriendRequest } from 'src/entities/friend-request.entity';
import { FriendShipService } from 'src/friends/friendShip.service';
import { use } from 'passport';

const users = Array<{ index: number; user: any; socket: Socket }>();

@WebSocketGateway({
  cors: {
    origin: '*', // on accepte les requetes venant de partout
  },
})
export class EventsGateway {
  private logger: Logger = new Logger('AppGateway');

  constructor(
    private userService: UsersService,
    private friendRequestService: FriendRequestService,
    private friendShipService: FriendShipService,
  ) {}

  @WebSocketServer()
  httpServer = createServer();
  io = new Server(this.httpServer);

  @SubscribeMessage('CONNECT')
  connect() {
    this.logger.log('connected serverside');
  }

  @SubscribeMessage('CHECK_USER_EXIST')
  async check_user_exist(client: Socket, username: string) {
    client.emit(
      'check_user_exist',
      (await this.userService.getUserByUsername(username)) != null,
    );
  }

  @SubscribeMessage('ADD_USER')
  add_user(
    client: Socket,
    data: {
      login: string;
    },
  ) {
    console.log('ADD_USER recu EventGateway', data); // NE RIEN FAIRE POUR L'INSTANT
    // users.push({
    //   index: users.length,
    //   login: data.login,
    //   socket: client,
    // });
  }

  @SubscribeMessage('UPDATE_USER_SOCKET')
  update_user_socket(
    client: Socket,
    data: {
      login: string;
    },
  ) {
    // if (users.findIndex((user) => user.login === data.login) >= 0) {
    //   users[users.findIndex((user) => user.login === data.login)].socket = // NE RIEN FAIRE POUR L'INSTANT
    //     client;
    // }
    // this.logger.log('UPDATE_USER_SOCKET recu EventGateway');
  }

  @SubscribeMessage('STORE_CLIENT_INFO')
  store_client_info(
    client: Socket,
    data: {
      user: any;
    },
  ) {
    users[users.findIndex((item) => item.socket.id == client.id)].user =
      data.user;

    client.emit('store_client_done');
    // if (users.findIndex((user) => user.login === data.login) >= 0) {
    //   users[users.findIndex((user) => user.login === data.login)].socket = // NE RIEN FAIRE POUR L'INSTANT
    //     client;
    // }
    // this.logger.log('UPDATE_USER_SOCKET recu EventGateway');
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

  @SubscribeMessage('SEND_FRIEND_REQUEST')
  async send_friend_request(
    client: Socket, // RIEN POUR L INSTANT
    data: {
      loginToSend: string;
    },
  ) {
    const userToSend = await this.userService.getUserByLogin(data.loginToSend);

    if (!userToSend) return;

    const userFriendList = await this.friendShipService.getUserFriendList(
      users.find((item) => item.socket.id == client.id).user.id,
    );

    if (
      userFriendList.find(
        (item) => item.id_1 == userToSend.id || item.id_2 == userToSend.id,
      ) != undefined
    )
      return;

    const check = await this.friendRequestService.getRelation(
      userToSend.id,
      users.find((item) => item.socket.id == client.id).user.id,
    );

    if (!check && userToSend) {
      this.friendRequestService
        .addFriendRequest(
          users.find((item) => item.socket.id == client.id).user.id,
          userToSend.id,
        )
        .then(() => {
          client.emit('updateProfileOther', {
            login: data.loginToSend,
            friendStatus: 'request-send',
          });
          if (
            users.find((item) => item.user.login == userToSend.login) !=
            undefined
          )
            users
              .find((item) => item.user.login == userToSend.login)
              .socket.emit('updateProfileOther', {
                login: users.find((item) => item.socket.id == client.id).user
                  .login,
                friendStatus: 'request-waiting',
              });
        });
    }
    console.log('oui');
  }

  @SubscribeMessage('DEL_FRIEND_REQUEST')
  async del_friend_request(
    client: Socket, // RIEN POUR L INSTANT
    data: {
      loginToSend: string;
    },
  ) {
    const userToCheck = await this.userService.getUserByLogin(data.loginToSend);

    if (!userToCheck) return;

    const check = await this.friendRequestService.getRelation(
      userToCheck.id,
      users.find((item) => item.socket.id == client.id).user.id,
    );

    if (!check) return;

    this.friendRequestService.delFriendRequest(check.id);

    client.emit('updateProfileOther', {
      login: data.loginToSend,
      friendStatus: 'not-friend',
    });
    if (users.find((item) => item.user.login == userToCheck.login) != undefined)
      users
        .find((item) => item.user.login == userToCheck.login)
        .socket.emit('updateProfileOther', {
          login: users.find((item) => item.socket.id == client.id).user.login,
          friendStatus: 'not-friend',
        });
  }

  @SubscribeMessage('ACCEPT_FRIEND_REQUEST')
  async accept_friend_request(
    client: Socket, // RIEN POUR L INSTANT
    data: {
      loginToSend: string;
    },
  ) {
    const userToCheck = await this.userService.getUserByLogin(data.loginToSend);

    if (!userToCheck) return;

    const check = await this.friendRequestService.getRelation(
      userToCheck.id,
      users.find((item) => item.socket.id == client.id).user.id,
    );

    if (!check || check.receiver_id == userToCheck.id) return;

    const friendList = await this.friendShipService.getUserFriendList(
      users.find((item) => item.socket.id == client.id).user.id,
    );

    if (
      friendList.find(
        (item) =>
          item.id_1 == userToCheck.id ||
          (item.id_2 == userToCheck.id) != undefined,
      )
    )
      return;

    console.log('accept');

    await this.friendRequestService.delFriendRequest(check.id);
    await this.friendShipService.addFriendShip(
      userToCheck.id,
      users.find((item) => item.socket.id == client.id).user.id,
    );

    client.emit('updateProfileOther', {
      login: data.loginToSend,
      friendStatus: 'friend',
    });
    if (users.find((item) => item.user.login == userToCheck.login) != undefined)
      users
        .find((item) => item.user.login == userToCheck.login)
        .socket.emit('updateProfileOther', {
          login: users.find((item) => item.socket.id == client.id).user.login,
          friendStatus: 'friend',
        });
  }

  @SubscribeMessage('REMOVE_FRIEND_SHIP')
  async remove_friend_ship(
    client: Socket, // RIEN POUR L INSTANT
    data: {
      loginToSend: string;
    },
  ) {
    const userToCheck = await this.userService.getUserByLogin(data.loginToSend);

    if (!userToCheck) return;

    const friendList = await this.friendShipService.getUserFriendList(
      users.find((item) => item.socket.id == client.id).user.id,
    );

    if (
      friendList.find(
        (item) => item.id_1 == userToCheck.id || item.id_2 == userToCheck.id,
      ) == undefined
    )
      return;

    this.friendShipService.delFriendShip(
      users.find((item) => item.socket.id == client.id).user.id,
      userToCheck.id,
    );

    client.emit('updateProfileOther', {
      login: data.loginToSend,
      friendStatus: 'not-friend',
    });
    if (users.find((item) => item.user.login == userToCheck.login) != undefined)
      users
        .find((item) => item.user.login == userToCheck.login)
        .socket.emit('updateProfileOther', {
          login: users.find((item) => item.socket.id == client.id).user.login,
          friendStatus: 'not-friend',
        });
  }

  @SubscribeMessage('GET_FRIEND_STATUS')
  async get_friend_status(
    client: Socket, // RIEN POUR L INSTANT
    data: {
      login: string;
    },
  ) {
    const userToCheck = await this.userService.getUserByLogin(data.login);

    console.log(userToCheck);

    if (!userToCheck) return;

    const check = await this.friendRequestService.getRelation(
      userToCheck.id,
      users.find((item) => item.socket.id == client.id).user.id,
    );

    console.log(check);

    if (check && check.receiver_id == userToCheck.id) {
      client.emit('updateProfileOther', {
        login: data.login,
        friendStatus: 'request-send',
      });
    } else if (check) {
      client.emit('updateProfileOther', {
        login: data.login,
        friendStatus: 'request-waiting',
      });
    } else {
      const userFriendList = await this.friendShipService.getUserFriendList(
        users.find((item) => item.socket.id == client.id).user.id,
      );

      if (
        userFriendList.find(
          (item) => item.id_1 == userToCheck.id || item.id_2 == userToCheck.id,
        ) != undefined
      )
        client.emit('updateProfileOther', {
          login: data.login,
          friendStatus: 'friend',
        });
      else
        client.emit('updateProfileOther', {
          login: data.login,
          friendStatus: 'not-friend',
        });
    }

    // if (check && userToSend) {
    //   this.friendRequestService
    //     .addFriendRequest(
    //       users.find((item) => item.socket.id == client.id).user.id,
    //       userToSend.id,
    //     )
    //     .then(() => {
    //       client.emit('updateProfileOther', {
    //         login: data.loginToSend,
    //         friendStatus: 'request-send',
    //       });
    //       if (
    //         users.find((item) => item.user.login == userToSend.login) !=
    //         undefined
    //       )
    //         users
    //           .find((item) => item.user.login == userToSend.login)
    //           .socket.emit('updateProfileOther', {
    //             login: users.find((item) => item.socket.id == client.id).user
    //               .login,
    //             friendStatus: 'request-waiting',
    //           });
    //     });
  }

  // @SubscribeMessage('FRIEND_REQUEST')
  // friend_request(client: Socket, data: {
  //   login: string;
  //   target: string;
  // }) {

  // }

  @SubscribeMessage('GET_USER_FRIENDS')
  async get_user_friends(client: Socket) {
    const userFriendList = await this.friendShipService.getUserFriendList(
      users.find((item) => item.socket.id == client.id).user.id,
    );
    const allUsers = await this.userService.getAll();

    const retArray = Array<{ username: string }>();

    allUsers.forEach((item) => {
      if (
        userFriendList.find(
          (tmp) => tmp.id_1 == item.id || tmp.id_2 == item.id,
        ) != undefined &&
        item.id != users.find((item) => item.socket.id == client.id).user.id
      ) {
        retArray.push({ username: item.username });
      }
    });
    client.emit('get_user_friends', retArray);
    // db_friendList.map((friend) => {                                 // IL FAUT ENVOYER TOUS LES FRIENDS DU login RECU EN ARG, TU PEUX UTILISER TA FONCTION MANY DU COUP
    //   if (friend.login === login || friend.login2 === login) {
    //     tmpArray.push({
    //       login: friend.login,
    //       login2: friend.login2,
    //       friendshipDate: friend.friendshipDate,
    //     });
    //   }
    // });
    // client.emit('get_user_friends', friends);
    // this.logger.log('send get_user_friends to ', login, 'with', friends);
  }

  @SubscribeMessage('GET_ALL_USERS_NOT_FRIEND')
  async get_all_users_not_friend(client: Socket, data: {username: string}) {
    // console.log('oui', users.find((item) => item.socket.id == client.id).user)
    const userFriendList = await this.friendShipService.getUserFriendList(
      users.find((item) => item.socket.id == client.id).user.id,
    );
    const allUsers = await this.userService.getAll();

    console.log('ouiouioui', allUsers);
    const retArray = Array<{ username: string }>();

    allUsers.forEach((item) => {
      if (
        userFriendList.find(
          (tmp) => tmp.id_1 == item.id || tmp.id_2 == item.id,
        ) == undefined &&
        item.id != users.find((item) => item.socket.id == client.id).user.id
      ) {
        if (item.username !== data.username)
        retArray.push({ username: item.username });
      }
    });
    console.log('nononononon', retArray);
    client.emit('get_all_users_not_friend', retArray);
  }

  handleConnection(client: Socket) {
    this.logger.log(`new client connected ${client.id}`);

    users.push({ index: users.length, user: {}, socket: client });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`client ${client.id} disconnected`);
    users.splice(
      users.findIndex((item) => item.socket.id == client.id),
      1,
    );
  }
}
