"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = exports.Map = exports.Player = exports.GameClass = exports.Canvas = void 0;
class Canvas {
    constructor() {
        this.width = 800;
        this.height = 600;
    }
}
exports.Canvas = Canvas;
class GameClass {
    constructor(gameMap, username, roomID, playerId) {
        this.gameOn = false;
        this.roomID = roomID;
        this.map = new Map(gameMap);
        this.canvas = new Canvas();
        this.ball = new Ball(this.canvas);
        this.players = new Array();
        this.players.push(new Player(this.canvas, username, playerId));
        this.players.push(new Player(this.canvas));
    }
    setOponnent(id, username) {
        this.players[1].id = id;
        this.players[1].username = username;
        this.players[1].inGame = true;
        this.players[1].posX = this.canvas.width / 10 * 9 - this.players[1].width / 2;
    }
    checkCollisionPlayer(id) {
        var ptop = this.players[id].posY;
        var pbottom = this.players[id].posY + this.players[id].height;
        var pleft = this.players[id].posX;
        var pright = this.players[id].posX + this.players[id].width;
        var btop = this.ball.posY - this.ball.radius;
        var bbottom = this.ball.posY + this.ball.radius;
        var bleft = this.ball.posX - this.ball.radius;
        var bright = this.ball.posX + this.ball.radius;
        return (pleft < bright && ptop < bbottom && pright > bleft && pbottom > btop);
    }
    movePlayer() {
        for (let i = 0; i < 2; i++) {
            if (this.players[i].goUp)
                if (this.players[i].posY >= this.players[i].speed)
                    this.players[i].posY -= this.players[i].speed;
            if (this.players[i].goDown)
                if (this.players[i].posY + this.players[i].height < this.canvas.height)
                    this.players[i].posY += this.players[i].speed;
        }
    }
    moveBall() {
        for (let i = 0; i < 2; i++) {
            if (this.checkCollisionPlayer(i)) {
                let collidePoint = (this.ball.posY - (this.players[i].posY + this.players[i].height / 2));
                collidePoint = collidePoint / (this.players[i].height / 2);
                let angleRad = (Math.PI / 4) * collidePoint;
                let direction = (this.ball.posX + this.ball.radius < this.canvas.width / 2) ? 1 : -1;
                this.ball.directionX = direction * this.ball.speed * Math.cos(angleRad);
                this.ball.directionY = this.ball.speed * Math.sin(angleRad);
                if (this.ball.speed < 6) {
                    this.ball.speed += 0.1;
                    this.players[0].speed += 0.1;
                    this.players[1].speed += 0.1;
                }
            }
        }
        if (this.ball.posY < this.ball.radius)
            this.ball.posY = this.ball.radius;
        else if (this.ball.posY > this.canvas.height - this.ball.radius)
            this.ball.posY = this.canvas.height - this.ball.radius;
        if (this.ball.posX + this.ball.directionX > this.canvas.width - this.ball.radius) {
            this.players[0].score++;
            this.reset();
            this.players[0].ready = false;
            this.players[1].ready = false;
            return;
        }
        if (this.ball.posX + this.ball.directionX < this.ball.radius) {
            this.players[1].score++;
            this.reset();
            this.players[0].ready = false;
            this.players[1].ready = false;
            return;
        }
        if (this.ball.posY + this.ball.directionY > this.canvas.height - this.ball.radius || this.ball.posY + this.ball.directionY < this.ball.radius) {
            this.ball.directionY = 0 - this.ball.directionY;
        }
        this.ball.posX += this.ball.directionX;
        this.ball.posY += this.ball.directionY;
    }
    reset() {
        this.ball.reset(this.canvas);
        if (this.players[0].score > this.players[1].score)
            this.ball.directionX = this.ball.speed;
        else if (this.players[0].score < this.players[1].score)
            this.ball.directionX = -this.ball.speed;
        for (let i = 0; i < 2; i++)
            this.players[i].reset(this.canvas);
        this.players[1].posX = this.canvas.width / 10 * 9 - this.players[1].width / 2;
    }
    moveAll() {
        this.moveBall();
        this.movePlayer();
    }
}
exports.GameClass = GameClass;
class Player {
    constructor(canvas, username = "", id = "") {
        this.username = username;
        this.id = id;
        this.width = canvas.width / 40;
        this.height = canvas.height / 5;
        this.goUp = false;
        this.goDown = false;
        this.score = 0;
        this.ready = false;
        this.speed = 3;
        this.posX = canvas.width / 10 - this.width / 2;
        this.posY = canvas.height / 2 - this.height / 2;
        this.reco = 0;
        this.inGame = false;
    }
    reset(canvas) {
        this.width = canvas.width / 40;
        this.height = canvas.height / 5;
        this.goDown = false;
        this.goUp = false;
        this.posX = canvas.width / 10 - this.width / 2;
        this.posY = canvas.height / 2 - this.height / 2;
        this.speed = 3;
    }
}
exports.Player = Player;
class Map {
    constructor(gameMap) {
        this.mapColor = "black";
        if (gameMap == "map1")
            this.mapColor = "black";
        else if (gameMap == "map2") {
            this.mapColor = 'yellow';
        }
        else if (gameMap == "map3") {
            this.mapColor = 'green';
        }
    }
}
exports.Map = Map;
class Ball {
    constructor(canvas) {
        this.posX = canvas.width / 2;
        this.posY = canvas.height / 2;
        this.speed = 2;
        this.directionX = random(0, 1) ? -this.speed : this.speed;
        this.directionY = 0;
        this.radius = 10;
    }
    reset(canvas) {
        this.posX = canvas.width / 2;
        this.posY = canvas.height / 2;
        this.speed = 2;
        this.directionX = random(0, 1) ? -this.speed : this.speed;
        this.directionY = 0;
        this.radius = 10;
    }
}
exports.Ball = Ball;
function random(min, max) {
    return (Math.floor(Math.random() * (max - min + 1)) + min);
}
//# sourceMappingURL=gameClass.js.map