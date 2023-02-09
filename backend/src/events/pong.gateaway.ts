import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameClass } from 'src/pong/gameClass';
import { Interval } from '@nestjs/schedule'
import { GameService } from 'src/game/game.service';

const users = Array<{ user: any; socket: Socket }>();

interface Client {
  id: string;
  username: string;
  socket: Socket
}

let allClients: Client[] = [];
const waitingForGame = Array<{
  map: string, user: {
    login: string;
  }
}>()
const waitingForInvite = Array<{
  map: string, user: {
    login: string;
  }
}>()

const spectators = Array<{
  roomId: string,
  login: string,
}>()

const UserDisconnected = []

@WebSocketGateway(5002, { transports: ['websocket'], "pingInterval": 5000, "pingTimeout": 20000 })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('PongGateway');
  private allGames: Array<GameClass> = new Array();
  constructor(
    private gameService: GameService,
  ) { }

  @WebSocketServer() io: Server;

  getRoomByID(roomID: string): [number, GameClass] | null {
    for (let i = 0; i < this.allGames.length; i++)
      if (this.allGames[i].roomID == roomID)
        return [i, this.allGames[i]]
    return null
  }

  getRoomByClientLogin(ClientLogin: string): [number, GameClass] | null {
    for (let i = 0; i < this.allGames.length; i++) {
      for (let j = 0; j < 2; j++) {
        if (this.allGames[i].players[j] != null && this.allGames[i].players[j].username == ClientLogin) {
          return [i, this.allGames[i]]
        }
      }
    }
    return null
  }

  getAllRoomByClientID(ClientID: string) {
    const tmp = []
    this.allGames.forEach((room, index) => {
      if (room.players.find(player => player.id == ClientID) != undefined)
        tmp.push({ index: index, room: room })
    })
    return (tmp)
  }

  @SubscribeMessage('JOIN_ROOM')
  async joinRoom(client: Socket, roomId: string) {
    this.logger.log(`[Pong-Gateway] { joinRoom } Client \'${allClients.find(item => item.id == client.id).username}\' join room \'${roomId}\'`)
    client.join(roomId);
  }

  async render(roomID: string) {
    var room = this.getRoomByID(roomID);
    if (room != null) {
      if (this.allGames[room[0]].players[0].score == 3 || this.allGames[room[0]].players[1].score == 3) {
        const data = {
          id_user1: room[1].players[0].username,
          score_u1: room[1].players[0].score,
          id_user2: room[1].players[1].username,
          score_u2: room[1].players[1].score,
          winner_id: room[1].players[0].score === 3 ? room[1].players[0].username : room[1].players[1].username,
          map: room[1].map.mapName,
        }
        this.gameService.createGame(data);
        this.allGames.splice(room[0], 1)
        this.io.to(room[1].roomID).emit('finish', { room: room[1], draw: false })
        let toRemove = Array<string>()
        spectators.map((user) => {
          if (user.roomId == room[1].roomID)
            toRemove.push(user.login);
        })
        for (var i = 0; i <= toRemove.length; i++) {
          spectators.splice(spectators.findIndex((u) => u.login == toRemove[i]), 1);
        }
        this.io.socketsLeave("room1");
        return;
      }
      this.io.to(roomID).emit("render", this.allGames[room[0]])
    }
  }

  finishGameDeco(data: { roomId: string, playerwin: number, playerdeco: number }) {
    var room = this.getRoomByID(data.roomId);
    if (room != null) {
      if (this.allGames[room[0]].players[data.playerdeco].score != 3)
        this.allGames[room[0]].players[data.playerwin].score = 3
      if (this.allGames[room[0]].players[0].score == 3 || this.allGames[room[0]].players[1].score == 3) {
        const data = {
          id_user1: room[1].players[0].username,
          score_u1: room[1].players[0].score,
          id_user2: room[1].players[1].username,
          score_u2: room[1].players[1].score,
          winner_id: room[1].players[0].score === 3 ? room[1].players[0].username : room[1].players[1].username,
          map: room[1].map.mapName,
        }
        this.gameService.createGame(data);
        this.allGames.splice(room[0], 1)
        this.io.to(room[1].roomID).emit('finish', { room: room[1], draw: true })
        let toRemove = Array<string>()
        spectators.map((user) => {
          if (user.roomId == room[1].roomID)
            toRemove.push(user.login);
        })
        for (var i = 0; i <= toRemove.length; i++) {
          spectators.splice(spectators.findIndex((u) => u.login == toRemove[i]), 1);
        }
        this.io.socketsLeave("room1");
      }
    }
  }

  @Interval(1000)
  checkDeco() {
    for (let index = 0; index < this.allGames.length; index++) {
      if (this.allGames[index].gameOn) {
        let millis0: number = 0;
        let millis1: number = 0;
        if (!this.allGames[index].players[0].ready && this.allGames[index].players[1].ready && this.allGames[index].players[0].reco === 0)
          this.allGames[index].players[0].reco = Date.now()
        else if (!this.allGames[index].players[1].ready && this.allGames[index].players[0].ready && this.allGames[index].players[1].reco === 0)
          this.allGames[index].players[1].reco = Date.now()
        else if (this.allGames[index].players[0].ready && this.allGames[index].players[0].reco != 0)
          this.allGames[index].players[0].reco = 0
        else if (this.allGames[index].players[1].ready && this.allGames[index].players[1].reco != 0)
          this.allGames[index].players[1].reco = 0
        else if (this.allGames[index].players[0].reco != 0)
          millis0 = Date.now() - this.allGames[index].players[0].reco
        else if (this.allGames[index].players[1].reco != 0)
          millis1 = Date.now() - this.allGames[index].players[1].reco
        if (millis0 != 0 && 10 - Math.floor(millis0 / 1000) === 0)
          this.finishGameDeco({ roomId: this.allGames[index].roomID, playerwin: 1, playerdeco: 0 })
        else if (millis1 != 0 && 10 - Math.floor(millis1 / 1000) === 0)
          this.finishGameDeco({ roomId: this.allGames[index].roomID, playerwin: 0, playerdeco: 1 })
      }
    }
  }

  @SubscribeMessage('CANCEL_GAME')
  cancelGame(client: Socket, data: { roomId: string }) {
    var room = this.getRoomByID(data.roomId);
    if (room != null) {
      this.allGames.splice(room[0], 1)
      this.io.to(room[1].roomID).emit('finish', { room: room[1], draw: true })
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`new client connected ${client.id}`);
    const newClient: Client = {
      id: client.id,
      username: "",
      socket: client
    };

    allClients.push(newClient);
    users.push({ user: {}, socket: client });
  }

  handleDisconnect(client: Socket) {
    //cherche l'utilisateur
    const user = users.find(clients => clients.socket.id == client.id)
    this.logger.log(`client disconnected ${client.id} : ${user.user.username}`);
    //ajouter l'utilisateur au tableau de gens deconnectes
    if (user != undefined && user.user.username != "" && user.user.username != undefined) {
      UserDisconnected.push({ username: user.user.username, date: new Date() })
    }
    //enleve l'utilisateur du tableau de tous les clients
    allClients.splice(allClients.findIndex(item => item.id == client.id), 1);
    users.splice(
      users.findIndex((item) => item.socket.id == client.id),
      1,
    );
  }

  @SubscribeMessage('CHECK_RECONNEXION')
  async checkReconnexion(client: Socket, user: { username: string }) {
    if (user.username != undefined) {
      allClients.find(item => item.id == client.id)!.username = user.username
      if (UserDisconnected.find((item) => item.username == user.username))
        UserDisconnected.splice(
          UserDisconnected.findIndex((item) => item.username == user.username),
          1,
        );
      const room = this.getRoomByClientLogin(user.username)
      if (room != null) {
        this.joinRoom(client, this.allGames[room[0]].roomID)
        this.allGames[room[0]].players[this.allGames[room[0]].players.findIndex(player => player.username == user.username)].id = client.id
        this.allGames[room[0]].players[this.allGames[room[0]].players.findIndex(player => player.username == user.username)].connect = true
        allClients.forEach((client) => {
          this.io.to(client.id).emit('getClientStatus', { user: this.allGames[room[0]].players[this.allGames[room[0]].players.findIndex(player => player.username == user.username)].username, status: 'in-game', emitFrom: 'CHECK_RECONNEXION' })
        })
        this.io.to(client.id).emit('start', room[1].roomID)
      }
    }
  }

  @Interval(1000)
  clientStatusGame() {
    UserDisconnected.forEach(async (user, index) => {
      if (new Date().getSeconds() - user.date.getSeconds() != 0) {
        // envoie au front que le client a ete deconnecté
        console.log('hey', user)
        users.forEach((client) => {
          this.io.to(client.socket.id).emit('getClientStatus', { user: user.username, status: 'offline', emitFrom: 'clientStatusGame' })
        })
        waitingForGame.splice(waitingForGame.findIndex(item => item.user.login == user.username), 1);
        UserDisconnected.splice(index, 1)
      }
    })
  }

  @Interval(16)
  async handleInterval() {
    for (let index = 0; index < this.allGames.length; index++) {
      if (this.allGames[index].gameOn) {
        if (!(this.allGames[index].players[0].score == 3 || this.allGames[index].players[1].score == 3))
          if (this.allGames[index].players[0].ready && this.allGames[index].players[1].ready)
            this.allGames[index].moveAll();
        this.render(this.allGames[index].roomID)
      }
    }
  }

  @SubscribeMessage('ENTER')
  async enter(client: Socket, info: [string, boolean]) {
    var room = this.getRoomByID(info[0])
    if (room != null) {
      for (let index = 0; index < 2; index++)
        if (this.allGames[room[0]].players[index].id == client.id)
          this.allGames[room[0]].players[index].ready = true
    }
  }

  @SubscribeMessage('ARROW_UP')
  async arrowUp(client: Socket, info: [string, boolean]) {
    var room = this.getRoomByID(info[0])
    if (room != null) {
      for (let index = 0; index < 2; index++)
        if (this.allGames[room[0]].players[index].id == client.id) {
          this.allGames[room[0]].players[index].goUp = info[1]
          if (info[1])
            this.allGames[room[0]].players[index].goDown = false
        }
    }
  }

  @SubscribeMessage('ARROW_DOWN')
  async arrowDown(client: Socket, info: [string, boolean]) {
    var room = this.getRoomByID(info[0])
    if (room != null) {
      for (let index = 0; index < 2; index++)
        if (this.allGames[room[0]].players[index].id == client.id) {
          this.allGames[room[0]].players[index].goDown = info[1]
          if (info[1])
            this.allGames[room[0]].players[index].goUp = false
        }
    }
  }

  @SubscribeMessage('START_GAME')
  async startGame(client: Socket, info: { user: { login: string }, gameMap: string }) {
    let oponnent: { map: string; user: { login: string; }};
    const spectateI = spectators.findIndex((u) => u.login == info.user.login)
    if (spectateI != -1) {
      client.leave(spectators[spectateI].roomId)
      spectators.splice(spectateI, 1);
    }
    const oldGame = this.getRoomByClientLogin(info.user.login);
    if (oldGame != null)
      this.finishGameDeco({ roomId: oldGame[1].roomID, playerwin: oldGame[1].players[0].username == info.user.login ? 1 : 0, playerdeco: oldGame[1].players[0].username == info.user.login ? 0 : 1 })
    if (waitingForGame.findIndex(item => item.user.login == info.user.login) != -1)
      waitingForGame.splice(waitingForGame.findIndex(item => item.user.login == info.user.login), 1)
    if ((oponnent = waitingForGame.find(item => item.map == info.gameMap)) != undefined && oponnent.user.login != info.user.login) {
      this.allGames.push(new GameClass(info.gameMap, info.user.login, info.user.login + oponnent.user.login, client.id))
      const room = this.getRoomByID(info.user.login + oponnent.user.login);
      this.allGames[room[0]].players[0].connect = true
      this.allGames[room[0]].setOponnent(allClients.find(client => client.username == oponnent.user.login).id, oponnent.user.login)
      this.allGames[room[0]].setOponnentObstacle()
      this.allGames[room[0]].gameOn = true
      this.joinRoom(client, room[1].roomID)
      allClients.find(client => client.username == oponnent.user.login).socket.emit('joinRoom', room[1].roomID)
      allClients.find(client => client.username == oponnent.user.login).socket.emit('start', room[1].roomID)
      this.io.to(client.id).emit('start', room[1].roomID)
      waitingForGame.splice(waitingForGame.findIndex(item => item.user.login == oponnent.user.login), 1)
      allClients.forEach((client) => {
        this.io.to(client.id).emit('getClientStatus', { user: this.allGames[room[0]].players[0].username, status: 'in-game', emitFrom: 'START_GAME' })
        this.io.to(client.id).emit('getClientStatus', { user: this.allGames[room[0]].players[1].username, status: 'in-game', emitFrom: 'START_GAME' })
      })
    }
    else {
      waitingForGame.push({ map: info.gameMap, user: { login: info.user.login } })
      this.io.to(client.id).emit('joined_waiting', info.user)
    }
  }

  @SubscribeMessage('SEE_LIST_GAME')
  async seeListGame(client: Socket, username: string) {
    let game : string = "noGame"
    if (this.allGames.length != 0) {
      this.allGames.map((room) => {
        if (room.players[0].username != username && room.players[1].username != username) {
          game = "yes"
          this.io.to(client.id).emit('add_room_playing', room);
        }
      })
      this.io.to(client.id).emit('set_list_game', game);
    }
    else {
      this.io.to(client.id).emit('set_list_game', game);
    }
  }

  @SubscribeMessage('START_SPECTATE')
  start_spectate(client: Socket, data: { username : string, roomID: string, start: boolean }) {
    const room = this.getRoomByID(data.roomID);
    if (room) {
      if (data.start == false) {
        const spectateI = spectators.findIndex((u) => u.login == data.username)
        if (spectateI != -1) {
          client.leave(spectators[spectateI].roomId)
          spectators.splice(spectateI, 1);
        }
        spectators.push({roomId : room[1].roomID, login : data.username})
        this.joinRoom(client, room[1].roomID)
      }
      if (spectators.find((u) => u.roomId == data.roomID))
        this.io.to(client.id).emit('start_spectate', room[1])
    }
  }

  @SubscribeMessage('INVITE_GAME')
  inviteGame(client: Socket, data: { sender: string, gameMap: string, receiver: string }) {
    const receiver = allClients.find(user => user.username == data.receiver);
    if (receiver) {
      const room = this.getRoomByClientLogin(receiver.username)
      if (!room)
        this.io.to(receiver.id).emit('invite_game', data);
    }
    else
      this.io.to(client.id).emit('cant_invite', data);
  }

  @SubscribeMessage('DECLINE_GAME')
  declineGame(client: Socket, data: { sender: string, gameMap: string, receiver: string }) {
    const sender = allClients.find(user => user.username == data.sender);
    if (sender)
      this.io.to(sender.id).emit('decline_game', data);
  }

  @SubscribeMessage('ACCEPT_GAME')
  acceptGame(client: Socket, data: { sender: string, gameMap: string, receiver: string }) {
    const sender = allClients.find(user => user.username == data.sender);
    if (sender) {
      this.io.to(sender.id).emit('accept_game', data);
      this.io.to(client.id).emit('redirect_to_game', data);
    }
  }

  @SubscribeMessage('GET_ROOM_ID')
  getRoomId(client: Socket, data: { userToSee: string }) {
    const room = this.getRoomByClientLogin(data.userToSee)
    if (room) {
      this.io.to(client.id).emit('getRoomId', room[1].roomID);
    }
  }

  @SubscribeMessage('START_INVITE_GAME')
  async startInviteGame(client: Socket, info: { user: { login: string }, gameMap: string, roomId: string }) {
    let oponnent: { map: string; user: { login: string } };
    const spectateI = spectators.findIndex((u) => u.login == info.user.login)
    if (spectateI != -1) {
      client.leave(spectators[spectateI].roomId)
      spectators.splice(spectateI, 1);
    }
    const oldGame = this.getRoomByClientLogin(info.user.login);
    if (oldGame != null)
      this.finishGameDeco({ roomId: oldGame[1].roomID, playerwin: oldGame[1].players[0].username == info.user.login ? 1 : 0, playerdeco: oldGame[1].players[0].username == info.user.login ? 0 : 1 })
    if ((oponnent = waitingForInvite.find(item => item.map == info.gameMap)) != undefined) {
      this.allGames.push(new GameClass(info.gameMap, info.user.login, info.roomId, client.id))
      const room = this.getRoomByID(info.roomId)
      this.allGames[room[0]].players[0].connect = true
      this.allGames[room[0]].setOponnent(allClients.find(client => client.username == oponnent.user.login).id, oponnent.user.login)
      this.allGames[room[0]].gameOn = true
      allClients.find(client => client.username == oponnent.user.login).socket.emit('start', room[1].roomID)
      this.io.to(client.id).emit('start', room[1].roomID)
      waitingForInvite.splice(waitingForInvite.findIndex(item => item.map == info.gameMap), 1)
      // console.table(this.allGames)
    }
    else {
      waitingForInvite.push({ map: info.gameMap, user: { login: info.user.login } })
      this.io.to(client.id).emit('joined_waiting', info.user)
    }
  }

  @SubscribeMessage('GET_CLIENT_STATUS')
  getUserStatus(client: Socket, data: { login: string }) {
    if (this.getRoomByClientLogin(data.login) != null) {
      this.io.to(client.id).emit('getClientStatus', {
        user: data.login,
        status: 'in-game',
        emitFrom: 'getUserStatus',
      });
    }
    else if (users.find((item) => item.user.login == data.login)) {

      console.log('ouiouiouioui', data.login);
      this.io.to(client.id).emit('getClientStatus', {
        user: data.login,
        status: 'online',
        emitFrom: 'getUserStatus',
      });
    }
    else
      this.io.to(client.id).emit('getClientStatus', {
        user: data.login,
        status: 'offline',
        emitFrom: 'getUserStatus',
      });
  }

  @SubscribeMessage('STORE_CLIENT_INFO')
  store_client_info(client: Socket, data: { user: any }) {
    this.logger.log('STORE_CLIENT_INFO event : ');
    users[users.findIndex((item) => item.socket.id == client.id)].user =
    data.user;

    if (UserDisconnected.find(item => item.username == data.user.username))
      UserDisconnected.splice(UserDisconnected.findIndex(item => item.username == data.user.username), 1)
      else
        users.forEach(user => {
          if (user.socket.id != client.id)
          this.io.to(user.socket.id).emit('getClientStatus', {
            user: data.user.login,
            status: 'online',
            emitFrom: 'getUserStatus',
          });
        })


    console.log('handleDisconnect', users)
  }

}