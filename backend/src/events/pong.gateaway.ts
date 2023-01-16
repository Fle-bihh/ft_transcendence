import {
    WebSocketGateway,
    SubscribeMessage,
    WebSocketServer,
} from '@nestjs/websockets';
import { createServer } from "http";
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameClass } from 'src/pong/gameClass';

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

@WebSocketGateway({
    cors: {
        origin: '*', // on accepte les requetes venant de partout
    },
})
  export class PongGateway {
    private logger: Logger = new Logger('AppGateway');
    private allGames: Array<GameClass> = new Array();

    @WebSocketServer()
    httpServer = createServer();
    io = new Server(this.httpServer);

    getRoomByID(roomID: string): [number, GameClass] | null {
      for (let i = 0; i < this.allGames.length; i++)
        if (this.allGames[i].roomID == roomID)
          return [i, this.allGames[i]]
      return null
    }

    @SubscribeMessage('UPDATE_USER')
    async update_user(client: Socket, user: { login: string }) {
      allClients.find(item => item.id == client.id)!.username = user.login;
      console.log('Update User ', user.login, " id : ", client.id)
    }

    @SubscribeMessage('JOIN_ROOM')
    async joinRoom(client: Socket, roomId: string) {
      this.logger.log(`[Pong-Gateway] { joinRoom } Client \'${allClients.find(item => item.id == client.id).username}\' join room \'${roomId}\'`)
      client.join(roomId);
    }

    @SubscribeMessage('RENDER')
    async render(client: Socket, roomID: string) {
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
          this.allGames.splice(room[0], 1)
          client.emit('finish', room[1])
          return;
        }
        this.allGames[room[0]]
        client.emit('render', this.allGames[room[0]])
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
      allClients.splice(allClients.findIndex(item => item.id == client.id), 1);
        this.logger.log(`client ${client.id} disconnected`);
    }
    
    @SubscribeMessage('ENTER')
    async enter(client: Socket, info: [string, boolean]) {
      var room = this.getRoomByID(info[0])
      console.log('ENTER', room)
      console.log('player 1', room[1].players[0])
      console.log('player 2', room[1].players[1])
      if (room != null) {
        for (let index = 0; index < 2; index++)
          if (this.allGames[room[0]].players[index].id == client.id)
            if (!this.allGames[room[0]].players[0].ready || !this.allGames[room[0]].players[1].ready) {
              this.allGames[room[0]].players[index].ready = true
            }
      }
    }
  
    @SubscribeMessage('ARROW_UP')
    async arrowUp(client: Socket, info: [string, boolean]) {
      console.log('UP')
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
      console.log('DOWN')
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
      console.log("start game back");
      if ((oponnent = waintingForGame.find(item => item.map == info.gameMap)) != undefined) {
        console.log("start game back 1");
        console.table(allClients);
        this.allGames.push(new GameClass(info.gameMap, info.user.login, info.user.login + oponnent.user.login, client.id))
        const room = this.getRoomByID(info.user.login + oponnent.user.login);
        this.allGames[room[0]].setOponnent(allClients.find(client => client.username == oponnent.user.login).id, oponnent.user.login)
        this.allGames[room[0]].gameOn = true
        this.joinRoom(client, room[1].roomID)
        console.log('socket ID moi : ', client.id);
        console.log('socket ID other : ', allClients.find(client => client.username == oponnent.user.login).id);
        allClients.find(client => client.username == oponnent.user.login).socket.emit('joinRoom', room[1].roomID)
        allClients.find(client => client.username == oponnent.user.login).socket.emit('start', room[1].roomID)
        client.emit('start', room[1].roomID)
        waintingForGame.splice(waintingForGame.findIndex(item => item.map == info.gameMap), 1)
        console.table(waintingForGame);
        console.table(this.allGames);
        console.table(allClients);
      }
      else {
        console.log("start game back 2");
        waintingForGame.push({ map: info.gameMap, user: info.user })
        client.emit('joined')
      }
  }
}