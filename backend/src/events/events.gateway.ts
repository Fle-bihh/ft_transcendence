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
import { FriendRequestService } from 'src/friends/friendRequest.service';
import { FriendShipService } from 'src/friends/friendShip.service';

const users = Array<{ user: any; socket: Socket }>();

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
  }

  @SubscribeMessage('CHECK_USER_EXIST')
  async check_user_exist(client: Socket, data: { username: string }) {
    let exist = false;

    let user = users.find((user) => user.socket.id === client.id);
    if (user) {
      try {
        if (await this.userService.getUserByUsername(data.username)) {
          exist = true;
        }
      } catch (error) {
        this.logger.log(
          'ERROR USERSERVICE getUserByUsername IN CHECK_USER_EXIST',
        );
      }
      try {
        if (
          await this.userService.isBlocked(user.user.username, data.username)
        ) {
          exist = false;
        }
      } catch (error) {
        this.logger.log('ERROR USERSERVICE isBlocked IN CHECK_USER_EXIST');
      }
    }
    if (user.user.username === data.username) {
      exist = false;
    }
    client.emit('check_user_exist', { exist: exist, username: data.username });
  }

  @SubscribeMessage('STORE_CLIENT_INFO')
  store_client_info(client: Socket, data: { user: any }) {
    users[users.findIndex((item) => item.socket.id == client.id)].user =
      data.user;
    client.emit('store_client_done');
  }

  @SubscribeMessage('GET_ALL_USERS')
  async get_all_users(client: Socket, login: string) {
    const retArray = Array<{ id: string; username: string }>();
    const user = await this.userService.getAll();
    user.map((user) => {
      retArray.push({
        id: user.id,
        username: user.username,
      });
    });
    client.emit('get_all_users', retArray);
  }

  @SubscribeMessage('SEND_FRIEND_REQUEST')
  async send_friend_request(
    client: Socket,
    data: { sender: string; receiver: string },
  ) {
    const userToSend = await this.userService.getUserByUsername(data.receiver);
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
    let receiverSocket;

    users.forEach((user) => {
      if (user.user.username === userToSend.username)
        receiverSocket = user.socket;
    });
    if (!check && userToSend) {
      this.friendRequestService
        .addFriendRequest(
          users.find((item) => item.socket.id == client.id).user.id,
          userToSend.id,
        )
        .then(() => {
          client.emit('updateProfileOther', {
            username: data.receiver,
            friendStatus: 'request-send',
          });
          // if ( users.find((item) => item.user.username == userToSend.username) != undefined ) {
          if (receiverSocket != undefined) {
            receiverSocket.emit('updateProfileOther', {
              username: users.find((item) => item.socket.id == client.id).user
                .username,
              friendStatus: 'request-waiting',
            });
            receiverSocket.emit('add_notif', {
              type: 'FRIENDREQUEST',
              data: { sender: data.sender },
            });
          }
        });
    }
  }

  @SubscribeMessage('DEL_FRIEND_REQUEST')
  async del_friend_request(
    client: Socket, // RIEN POUR L INSTANT
    data: {
      receiver: string;
    },
  ) {
    const userToCheck = await this.userService.getUserByUsername(data.receiver);

    if (!userToCheck) return;

    const check = await this.friendRequestService.getRelation(
      userToCheck.id,
      users.find((item) => item.socket.id == client.id).user.id,
    );

    if (!check) return;

    this.friendRequestService.delFriendRequest(check.id);

    client.emit('updateProfileOther', {
      username: data.receiver,
      friendStatus: 'not-friend',
    });
    if (
      users.find((item) => item.user.username == userToCheck.username) !=
      undefined
    ) {
      users
        .find((item) => item.user.username == userToCheck.username)
        .socket.emit('updateProfileOther', {
          username: users.find((item) => item.socket.id == client.id).user
            .username,
          friendStatus: 'not-friend',
        });
    }
  }

  @SubscribeMessage('ACCEPT_FRIEND_REQUEST')
  async accept_friend_request(
    client: Socket, // RIEN POUR L INSTANT
    data: {
      receiver: string;
    },
  ) {
    const userToCheck = await this.userService.getUserByUsername(data.receiver);

    if (!userToCheck) return;

    const check = await this.friendRequestService.getRelation(
      userToCheck.id,
      users.find((item) => item.socket.id == client.id).user.id,
    );

    if (!check || check.receiver_id == userToCheck.id) return;

    const friendList = await this.friendShipService.getUserFriendList(
      users.find((item) => item.socket.id == client.id).user.id,
    );

    await this.friendRequestService.delFriendRequest(check.id);
    await this.friendShipService.addFriendShip(
      userToCheck.id,
      users.find((item) => item.socket.id == client.id).user.id,
    );

    client.emit('updateProfileOther', {
      username: data.receiver,
      friendStatus: 'friend',
    });
    if (
      users.find((item) => item.user.username == userToCheck.username) !=
      undefined
    )
      users
        .find((item) => item.user.username == userToCheck.username)
        .socket.emit('updateProfileOther', {
          username: users.find((user) => user.socket.id === client.id).user
            .username,
          friendStatus: 'friend',
        });
  }

  @SubscribeMessage('REMOVE_FRIEND_SHIP')
  async remove_friend_ship(
    client: Socket,
    data: {
      receiver: string;
    },
  ) {
    const userToCheck = await this.userService.getUserByUsername(data.receiver);

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
      username: data.receiver,
      friendStatus: 'not-friend',
    });
    if (
      users.find((item) => item.user.username == userToCheck.username) !=
      undefined
    )
      users
        .find((item) => item.user.username == userToCheck.username)
        .socket.emit('updateProfileOther', {
          username: users.find((user) => user.socket.id === client.id).user
            .username,
          friendStatus: 'not-friend',
        });
  }

  @SubscribeMessage('GET_FRIEND_STATUS')
  async get_friend_status(client: Socket, data: { username: string }) {
    try {
      const userToCheck = await this.userService.getUserByUsername(
        data.username,
      );
      if (!userToCheck) return;
      const check = await this.friendRequestService.getRelation(
        userToCheck.id,
        users.find((item) => item.socket.id == client.id).user.id,
      );
      const blocked = await this.userService.getBlockList(
        users.find((item) => item.socket.id == client.id).user,
      );
      if (
        blocked.blockList.findIndex((item) => item.id == userToCheck.id) != -1
      )
        client.emit('updateProfileOther', {
          username: data.username,
          friendStatus: 'blocked',
        });
      else {
        if (check && check.receiver_id == userToCheck.id) {
          client.emit('updateProfileOther', {
            username: data.username,
            friendStatus: 'request-send',
          });
        } else if (check) {
          client.emit('updateProfileOther', {
            username: data.username,
            friendStatus: 'request-waiting',
          });
        } else {
          const userFriendList = await this.friendShipService.getUserFriendList(
            users.find((item) => item.socket.id == client.id).user.id,
          );
          if (
            userFriendList.find(
              (item) =>
                item.id_1 == userToCheck.id || item.id_2 == userToCheck.id,
            ) != undefined
          )
            client.emit('updateProfileOther', {
              username: data.username,
              friendStatus: 'friend',
            });
          else
            client.emit('updateProfileOther', {
              username: data.username,
              friendStatus: 'not-friend',
            });
        }
      }
    } catch (error) {
    }
  }

  @SubscribeMessage('GET_USER_FRIENDS')
  async get_user_friends(client: Socket, data: { username: string }) {
    const user = users.find((item) => (item.user.username != undefined && item.user.username === data.username));
    if (!user)
      return;
    const userFriendList = await this.friendShipService.getUserFriendList(user.user.id);
    const allUsers = await this.userService.getAll();
    const retArray = Array<{ username: string }>();
    for (let item of allUsers) {
      if (!(await this.userService.isBlocked(item.username, user.user.username)) &&
      userFriendList.find((tmp) => (tmp.id_1 == item.id || tmp.id_2 == item.id) ) && item.id != user.user.id) {
          retArray.push({ username: item.username });
      }
    }
    client.emit('get_user_friends', retArray);
  }

  @SubscribeMessage('GET_ALL_USERS_NOT_FRIEND')
  async get_all_users_not_friend(client: Socket, data: { username: string }) {
    const user = users.find((item) => (item.user.username != undefined && item.user.username === data.username));
    if (!user)
      return;
    const userFriendList = await this.friendShipService.getUserFriendList(user.user.id);
    const allUsers = await this.userService.getAll();
    const retArray = Array<{ username: string }>();
    for (let item of allUsers) {
      if ((await this.userService.isBlocked(item.username, data.username) || !userFriendList.find( (tmp) => (tmp.id_1 == item.id || tmp.id_2 == item.id))) &&
      item.id != user.user.id) {
        if (item.username !== data.username)
          retArray.push({ username: item.username });
      }
    }
    client.emit('get_all_users_not_friend', retArray);
  }

  @SubscribeMessage('DISCONNECT_SOCKET')
  disconnectSocket(client: Socket) {
    users.splice(
      users.findIndex((item) => item.socket.id == client.id),
      1,
    );
  }

  handleConnection(client: Socket) {
    users.push({ user: {}, socket: client });
  }

  handleDisconnect(client: Socket) {
    users.splice(
      users.findIndex((item) => item.socket.id == client.id),
      1,
    );
  }
}
