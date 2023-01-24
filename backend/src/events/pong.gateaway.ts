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
import { Interval } from 'nestjs-schedule'

interface Client {
id : string;
username : string;
socket : Socket
}

let allClients: Client[] = [];
const waintingForGame = Array<{
map: string, user: {
  login: string;
}
}>()

const UserToReconnect = []

@WebSocketGateway(5002, { transports: ['websocket'] })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('AppGateway');
  private allGames: Array<GameClass> = new Array();

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
          id_user1: room[1].players[0].id,
          score_u1: room[1].players[0].score,
          id_user2: room[1].players[1].id,
          score_u2: room[1].players[1].score,
          winner_id: room[1].players[0].score === 3 ? room[1].players[0].id : room[1].players[1].id,
        }
        //push DB
        this.allGames.splice(room[0], 1)
        this.io.to(room[1].roomID).emit('finish', room[1])
        return;
      }
      this.io.to(roomID).emit("render", this.allGames[room[0]])
    }
  }

  handleConnection(client: Socket) {
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
    //ajouter l'utilisateur au tableau de gens a reconnecter si il existe
    if (user != undefined && user.username != "" && user.username != undefined) {
      UserToReconnect.push({ username: user.username, date: new Date() })
    }
    //enleve l'utilisateur du tableau de tous les clients
    allClients.splice(allClients.findIndex(item => item.id == client.id), 1);
    //cherche toutes les salles ou joue le client
    const allRoom = this.getAllRoomByClientID(client.id)
    for (let i = 0; i < allRoom.length; i++) {
      //cherche l'index du player
      const player = this.allGames[allRoom[i].index].players.findIndex(player => player.id == client.id);
      //enleve le player du jeu
      this.allGames[allRoom[i].index].players[player].inGame = false
      //set la date de la reconnection a maintenant
      this.allGames[allRoom[i].index].players[player].reco = Date.now()
      if (!this.allGames[allRoom[i].index].players[0].inGame && !this.allGames[allRoom[i].index].players[1].inGame) {
        //si on a un probleme de connection alors on fini le jeu et on fait gagner le dernier joueur connecté
        if (this.allGames[allRoom[i].index].players[1].username != "") {
          this.allGames[allRoom[i].index].players[player].score = 3
          const data = {
            id_user1: this.allGames[allRoom[i].index].players[0].id,
            score_u1: this.allGames[allRoom[i].index].players[0].score,
            id_user2: this.allGames[allRoom[i].index].players[1].id,
            score_u2: this.allGames[allRoom[i].index].players[1].score,
            winner_id: this.allGames[allRoom[i].index].players[0].score === 3 ? this.allGames[allRoom[i].index].players[0].id : this.allGames[allRoom[i].index].players[1].id,
            //add mapstring
          }
          //creer dans la DB le résultat du match
          // const match = this.MatchesHistoryService.createMatch(data);
          //send notif to user qui a perdu a cause de la connection pour lui dire qu'il a perdu
          this.allGames[allRoom[i].index].players.forEach((item, index) => {
            if (!item.inGame && item.id != client.id) {
              allClients.forEach((client) => {
                if (client.username == item.username)
                  this.io.to(client.id).emit('notif', { type: 'LOOSEGAMEDISCONECT', data: { opponentLogin: this.allGames[allRoom[i].index].players[index ? 0 : 1].username, roomId: this.allGames[allRoom[i].index].roomID } })
              })
            }
          })
          //send finish to the room finished
          this.io.to(this.allGames[allRoom[i].index].roomID).emit('finish', this.allGames[allRoom[i].index])
        }
        //enleve la room du tableau des room en cours
        this.allGames.splice(allRoom[i].index, 1)
        this.logger.log(`client ${client.id} disconnect`);
      }
    }
  }

  @SubscribeMessage('CHECK_RECONNEXION')
  async checkReconnexion( client: Socket, user: { login: string }) {
    allClients.find(item => item.id == client.id)!.username = user.login
    const room = this.getRoomByClientLogin(user.login)
    if (room != null) {
      this.joinRoom(client, this.allGames[room[0]].roomID)
      this.allGames[room[0]].players[this.allGames[room[0]].players.findIndex(player => player.username == user.login)].id = client.id
      this.allGames[room[0]].players[this.allGames[room[0]].players.findIndex(player => player.username == user.login)].inGame = true
      allClients.forEach((client) => {
        this.io.to(client.id).emit('getClientStatus', { user: this.allGames[room[0]].players[this.allGames[room[0]].players.findIndex(player => player.username == user.login)].username, status: 'in-game', emitFrom: 'CHECK_RECONNEXION' })
      })
      this.io.to(client.id).emit('start', room[1].roomID)
    }
  }

  @Interval(1000)
  clientStatusGame() {
    UserToReconnect.forEach(async (user, index) => {
      if (new Date().getSeconds() - user.date.getSeconds() != 0) {
        // envoie au front que le client a ete deconnecté
        allClients.forEach((client) => {
          this.io.to(client.id).emit('getClientStatus', { user: user.username, status: 'offline', emitFrom: 'clientStatusGame' })
        })
        this.logger.log(`[Pong-Gateway] Client \'${user.username}\' disconnect`)
        UserToReconnect.splice(index, 1)
      }
    })
  }

  @SubscribeMessage('HANDLE_INTERVAL')
  async handleInterval() {
      for (let index = 0; index < this.allGames.length; index++) {
        if (this.allGames[index].gameOn) {
          let stop = false
          for (let i = 0; i < 2; i++)
            if (!this.allGames[index].players[i].inGame) {
              this.allGames[index].players[i].ready = false
              if ((15 - Math.floor((Date.now() - this.allGames[index].players[i].reco) / 1000)) == 0 && this.allGames[index].players[i ? 0 : 1].score != 3) {
                var room = this.getRoomByID(this.allGames[index].roomID)
                this.allGames[index].players[i ? 0 : 1].score = 3
                const data = {
                  id_user1: room[1].players[0].id,
                  score_u1: room[1].players[0].score,
                  id_user2: room[1].players[1].id,
                  score_u2: room[1].players[1].score,
                  winner_id: room[1].players[0].score === 3 ? room[1].players[0].id : room[1].players[1].id,
                }
                // const match = this.MatchesHistoryService.createMatch(data);
                room[1].players.forEach((item, index) => {
                  if (!item.inGame) {
                    allClients.forEach((client) => {
                      if (client.username == item.username)
                        client.socket.emit('notif', { type: 'LOOSEGAMEDISCONECT', data: { opponentLogin: room[1].players[index ? 0 : 1].username, roomId: room[1].roomID } })
                    })
                  }
                })
                stop = true
                this.io.to(room[1].roomID).emit('finish', room[1])
                this.allGames.splice(room[0], 1)
              }
            }
            else if (this.allGames[index].players[i ? 0 : 1].inGame)
              if (!(this.allGames[index].players[0].score == 3 || this.allGames[index].players[1].score == 3))
                if (this.allGames[index].players[0].ready && this.allGames[index].players[1].ready)
                  this.allGames[index].moveAll();
          if (!stop) {
            this.render(this.allGames[index].roomID)
          }
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
  async startGame(client: Socket, info: { user: { login: string}, gameMap: string }) {
    let oponnent: {
      map: string; user: {
        login: string;
      }
    };
    if ((oponnent = waintingForGame.find(item => item.map == info.gameMap)) != undefined) {
      this.allGames.push(new GameClass(info.gameMap, info.user.login, info.user.login + oponnent.user.login, client.id))
      const room = this.getRoomByID(info.user.login + oponnent.user.login);
      this.allGames[room[0]].players[0].inGame = true
      this.allGames[room[0]].setOponnent(allClients.find(client => client.username == oponnent.user.login).id, oponnent.user.login)
      this.allGames[room[0]].gameOn = true
      this.joinRoom(client, room[1].roomID)
      allClients.find(client => client.username == oponnent.user.login).socket.emit('joinRoom', room[1].roomID)
      allClients.find(client => client.username == oponnent.user.login).socket.emit('start', room[1].roomID)
      this.io.to(client.id).emit('start', room[1].roomID)
      waintingForGame.splice(waintingForGame.findIndex(item => item.map == info.gameMap), 1)
      console.table(waintingForGame);
      console.table(this.allGames);
      console.table(allClients);
    }
    else {
      waintingForGame.push({ map: info.gameMap, user: info.user })
      this.io.to(client.id).emit('joined_waiting', info.user)
    }
}
}
