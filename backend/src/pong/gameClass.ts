export class Canvas {
	width: number
	height: number

	constructor() {
		this.width = 800
		this.height = 600
	}
}

export class GameClass {
    gameOn : boolean
    map : Map
    roomID : string
    canvas : Canvas
    ball : Ball
    players : Array<Player>

    constructor(gameMap : string, username : string, roomID : string, playerId : string){
        this.gameOn = false
        this.roomID = roomID
		this.canvas = new Canvas()
        this.map = new Map(gameMap, this.canvas)
        this.ball = new Ball(this.canvas)
        this.players = new Array()
        this.players.push(new Player(this.canvas, username, playerId))
		this.players.push(new Player(this.canvas))
    }

    setOponnent(id: string, username: string) {
		this.players[1].id = id
		this.players[1].username = username
		this.players[1].inGame = true
		this.players[1].posX = this.canvas.width / 10 * 9 - this.players[1].width / 2
	}

	setOponnentObstacle() {
		this.map.mapObstacles[1].posX = this.canvas.width / 4 * 3 - this.map.mapObstacles[1].width
	}

    checkCollisionPlayer(id: number): boolean {
		var ptop = this.players[id].posY
		var pbottom = this.players[id].posY + this.players[id].height
		var pleft = this.players[id].posX
		var pright = this.players[id].posX + this.players[id].width
		var btop = this.ball.posY - this.ball.radius
		var bbottom = this.ball.posY + this.ball.radius
		var bleft = this.ball.posX - this.ball.radius
		var bright = this.ball.posX + this.ball.radius
		return (pleft < bright && ptop < bbottom && pright > bleft && pbottom > btop)
	}

	checkCollisionObstacle(id: number): boolean {
		var otop = this.map.mapObstacles[id].posY
		var obottom = this.map.mapObstacles[id].posY + this.map.mapObstacles[id].height
		var oleft = this.map.mapObstacles[id].posX
		var oright = this.map.mapObstacles[id].posX + this.map.mapObstacles[id].width
		var btop = this.ball.posY - this.ball.radius
		var bbottom = this.ball.posY + this.ball.radius
		var bleft = this.ball.posX - this.ball.radius
		var bright = this.ball.posX + this.ball.radius
		return (oleft < bright && otop < bbottom && oright > bleft && obottom > btop)
	}

    movePlayer() {
		for (let i = 0; i < 2; i++) {
			if (this.players[i].goUp)
				if (this.players[i].posY >= this.players[i].speed)
					this.players[i].posY -= this.players[i].speed
			if (this.players[i].goDown)
				if (this.players[i].posY + this.players[i].height < this.canvas.height)
					this.players[i].posY += this.players[i].speed
		}
	}

    moveBall() {
		for (let i = 0; i < 2; i++) {
			if (this.checkCollisionPlayer(i)) {
				let collidePoint = (this.ball.posY - (this.players[i].posY + this.players[i].height / 2))
				collidePoint = collidePoint / (this.players[i].height / 2)
				let angleRad = (Math.PI / 4) * collidePoint
				let direction = (this.ball.posX + this.ball.radius < this.canvas.width / 2) ? 1 : -1
				this.ball.directionX = direction * this.ball.speed * Math.cos(angleRad)
				this.ball.directionY = this.ball.speed * Math.sin(angleRad)
				if (this.ball.speed < 6) {
					this.ball.speed += 0.1
					this.players[0].speed += 0.1
					this.players[1].speed += 0.1
				}
			}
        }
		for (let i = 0; i < 2; i++) {
			if (this.checkCollisionObstacle(i)) {
				this.ball.directionX *= -1
			}
        }
		if (this.ball.posY < this.ball.radius)
			this.ball.posY = this.ball.radius
		else if (this.ball.posY > this.canvas.height - this.ball.radius)
			this.ball.posY = this.canvas.height - this.ball.radius
		if (this.ball.posX + this.ball.directionX > this.canvas.width - this.ball.radius) {
			this.players[0].score++
			this.reset()
			this.players[0].ready = false
			this.players[1].ready = false
			return
		}
		if (this.ball.posX + this.ball.directionX < this.ball.radius) {
			this.players[1].score++
			this.reset()
			this.players[0].ready = false
			this.players[1].ready = false
			return
		}
		if (this.ball.posY + this.ball.directionY > this.canvas.height - this.ball.radius || this.ball.posY + this.ball.directionY < this.ball.radius) {
			this.ball.directionY = 0 - this.ball.directionY
		}
		this.ball.posX += this.ball.directionX
		this.ball.posY += this.ball.directionY
	}

    reset() {
		this.ball.reset(this.canvas)
		if (this.players[0].score > this.players[1].score)
			this.ball.directionX = this.ball.speed
		else if (this.players[0].score < this.players[1].score)
			this.ball.directionX = -this.ball.speed
		for (let i = 0; i < 2; i++)
			this.players[i].reset(this.canvas)
		this.players[1].posX = this.canvas.width / 10 * 9 - this.players[1].width / 2
	}

    moveAll() {
		this.moveBall()
		this.movePlayer()
	}
}

export class Player {
    id : string
    username : string
    width : number
    height : number
    goUp : boolean
    goDown : boolean
    posX : number
    posY : number
    score : number
    ready : boolean
    speed : number
	reco : number
	inGame : boolean

    constructor (canvas : Canvas, username : string = "", id : string = ""){
        this.username = username
        this.id = id
        this.width = canvas.width / 40
        this.height = canvas.height / 5
        this.goUp = false
        this.goDown = false
        this.score = 0
        this.ready = false
        this.speed = 3
        this.posX = canvas.width / 10 - this.width / 2
        this.posY = canvas.height / 2 - this.height / 2
		this.reco = 0
		this.inGame = false
    }

    reset(canvas: Canvas) {
		this.width = canvas.width / 40
		this.height = canvas.height / 5
		this.goDown = false
		this.goUp = false
		this.posX = canvas.width / 10 - this.width / 2
		this.posY = canvas.height / 2 - this.height / 2
		this.speed = 3
	}
}



export class Map {

	mapColor: string
	mapName: string
	printObstacle: boolean
	mapObstacles: Array<Obstacle>

	constructor(gameMap: string, canvas: Canvas) {
		this.printObstacle = false
		this.mapObstacles = new Array()
		this.mapColor = "black"
		this.mapName = gameMap

		if (gameMap == "map1")
			this.mapColor = "black"

		else if (gameMap == "map2") {
			this.mapColor = 'blue'
			this.printObstacle = true
			this.mapObstacles.push(new Obstacle(canvas))
			this.mapObstacles.push(new Obstacle(canvas))
		}

		else if (gameMap == "map3") {
			this.mapColor = 'green'
		}
	}
}

export class Obstacle {

	posX : number
	posY : number
	height : number
	width : number

	constructor(canvas: Canvas){
		this.height = canvas.height / 4
		this.width = canvas.width / 64
		this.posX = canvas.width / 4
		this.posY = random(0, 1) ? canvas.height / 10 : canvas.height - this.height - canvas.height / 10
    }
}

export class Ball {
    posX : number
    posY : number
    directionX : number
    directionY : number
    speed : number
    radius : number

    constructor(canvas : Canvas) {
        this.posX = canvas.width / 2
        this.posY = canvas.height / 2
        this.speed = 3
        this.directionX = random(0, 1) ? - this.speed : this.speed
        this.directionY = 0
        this.radius = 10;
    }

    reset(canvas: Canvas) {
		this.posX = canvas.width / 2
		this.posY = canvas.height / 2
		this.speed = 3
		this.directionX = random(0, 1) ? - this.speed : this.speed
		this.directionY = 0
		this.radius = 10
	}
}

function random(min: number, max: number): number {
	return (Math.floor(Math.random() * (max - min + 1)) + min)
}