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
        return;
      }
      this.io.to(roomID).emit("render", this.allGames[room[0]])
    }
  }

  finishGameDeco(data: { roomId: string, playerwin: number, playerdeco: number }) {
    console.log("finish game deco")
    var room = this.getRoomByID(data.roomId);
    console.log("room = ", room)
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
      }
    }
  }

  @Interval(5000)
  checkDeco() {
    for (let index = 0; index < this.allGames.length; index++) {
      console.log("check deco")
      if (this.allGames[index].gameOn) {
        let millis0: number = 0;
        let millis1: number = 0;
        console.log("ready 0 : ", this.allGames[index].players[0].ready, " ready 1 : ", this.allGames[index].players[1].ready)
        console.log("reco 0 : ", this.allGames[index].players[0].reco, " reco 1 : ", this.allGames[index].players[1].reco)
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
    console.log("cancel game deco")
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
  }

  handleDisconnect(client: Socket) {
    //cherche l'utilisateur
    const user = allClients.find(clients => clients.id == client.id)
    this.logger.log(`client disconnected ${client.id} : ${user.username}`);
    //ajouter l'utilisateur au tableau de gens deconnectes
    if (user != undefined && user.username != "" && user.username != undefined) {
      UserDisconnected.push({ username: user.username, date: new Date() })
    }
    //enleve l'utilisateur du tableau de tous les clients
    allClients.splice(allClients.findIndex(item => item.id == client.id), 1);
  }

  @SubscribeMessage('CHECK_RECONNEXION')
  async checkReconnexion(client: Socket, user: { username: string }) {
    allClients.find(item => item.id == client.id)!.username = user.username
    console.log(`Check reco ${client.id} : ${user.username}`);
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

  @Interval(1000)
  clientStatusGame() {
    UserDisconnected.forEach(async (user, index) => {
      if (new Date().getSeconds() - user.date.getSeconds() != 0) {
        // envoie au front que le client a ete deconnecté
        allClients.forEach((client) => {
          this.io.to(client.id).emit('getClientStatus', { user: user.username, status: 'offline', emitFrom: 'clientStatusGame' })
        })
        this.logger.log(`[Pong-Gateway] Client \'${user.username}\' disconnect`)
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
    let oponnent: {
      map: string; user: {
        login: string;
      }
    };
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
      console.table(waitingForGame);
      console.table(this.allGames);
      console.table(allClients);
    }
    else {
      waitingForGame.push({ map: info.gameMap, user: { login: info.user.login } })
      console.table(waitingForGame)
      this.io.to(client.id).emit('joined_waiting', info.user)
    }
  }

  @SubscribeMessage('SEE_LIST_GAME')
  async seeListGame(client: Socket, username: string) {
    console.log("length de all games : ", this.allGames.length)
    if (this.allGames.length != 0) {
      this.allGames.map((room) => {
        this.io.to(client.id).emit('add_room_playing', room);
      })
      this.io.to(client.id).emit('set_list_game', "yes");
    }
    else {
      this.io.to(client.id).emit('set_list_game', "noGame");
    }
  }

  @SubscribeMessage('START_SPECTATE')
  start_spectate(client: Socket, data: { roomID: string, start: boolean }) {
    const room = this.getRoomByID(data.roomID);
    if (room) {
      if (data.start == false)
        this.joinRoom(client, room[1].roomID)
      this.io.to(client.id).emit('start_spectate', room[1])
    }
  }

  @SubscribeMessage('INVITE_GAME')
  inviteGame(client: Socket, data: { sender: string, gameMap: string, receiver: string }) {
    console.log("invite game data : ", data)
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
    console.log("decline game data : ", data)
    const sender = allClients.find(user => user.username == data.sender);
    if (sender)
      this.io.to(sender.id).emit('decline_game', data);
  }

  @SubscribeMessage('ACCEPT_GAME')
  acceptGame(client: Socket, data: { sender: string, gameMap: string, receiver: string }) {
    console.log("accept game data : ", data)
    const sender = allClients.find(user => user.username == data.sender);
    if (sender) {
      this.io.to(sender.id).emit('accept_game', data);
      this.io.to(client.id).emit('redirect_to_game', data);
    }
  }

  @SubscribeMessage('START_INVITE_GAME')
  async startInviteGame(client: Socket, info: { user: { login: string }, gameMap: string, roomId: string }) {
    let oponnent: { map: string; user: { login: string } };
    if ((oponnent = waitingForInvite.find(item => item.map == info.gameMap)) != undefined) {
      this.allGames.push(new GameClass(info.gameMap, info.user.login, info.roomId, client.id))
      const room = this.getRoomByID(info.roomId)
      this.allGames[room[0]].players[0].connect = true
      this.allGames[room[0]].setOponnent(allClients.find(client => client.username == oponnent.user.login).id, oponnent.user.login)
      this.allGames[room[0]].gameOn = true
      allClients.find(client => client.username == oponnent.user.login).socket.emit('start', room[1].roomID)
      this.io.to(client.id).emit('start', room[1].roomID)
      waitingForInvite.splice(waitingForInvite.findIndex(item => item.map == info.gameMap), 1)
      console.table(waitingForInvite)
      console.table(this.allGames)
      console.log(room[1].players)
      console.table(allClients)
    }
    else {
      waitingForInvite.push({ map: info.gameMap, user: { login: info.user.login } })
      console.table(waitingForInvite)
      this.io.to(client.id).emit('joined_waiting', info.user)
    }
  }
}
