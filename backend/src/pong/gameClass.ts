
export class Canvas {
	width: number
	height: number

	constructor() {
		this.width = 800
		this.height = 600
	}
}

export class GameClass {
    groundWidth: number
    groundHeight : number
    groundColor: string
    netWidth : number
    netColor : string
    scorePosPlayer1 : number
    scorePosPlayer2 : number
    gameOn : boolean
    startGameButton : any
    map : Map
    roomID : string
    canvas : Canvas
    ball : Ball
    players : Array<Player>
    KEYDOWN : string
    KEYUP : string
    KEYZ : string
    KEYS : string
    SPACEBAR : string

    constructor(gameMap : string, username : string, roomID : string, playerId : string){
        this.groundWidth = 700
        this.groundHeight = 400
        this.groundColor = "#000000"
        this.netWidth = 6
        this.netColor = "#FFFFFF"
        this.scorePosPlayer1 = 300
        this.scorePosPlayer2 = 365
        this.gameOn = false
        this.roomID = roomID
        this.map = new Map(gameMap)
        this.startGameButton = null
        this.canvas = new Canvas()
        this.ball = new Ball(this.canvas)
        this.players = new Array()
        this.players.push(new Player(this.canvas, username, playerId))
		this.players.push(new Player(this.canvas))
        this.KEYDOWN = "ArrowDown"
        this.KEYUP = "ArrowUp"
        this.KEYZ = "z"
        this.KEYS = "s"
        this.SPACEBAR = " "
    }

    setOponnent(id: string, username: string) {
		this.players[1].id = id
		this.players[1].username = username
		this.players[1].inGame = true
		this.players[1].posX = this.canvas.width / 10 * 9 - this.players[1].width / 2
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

	constructor(gameMap: string) {
		if (gameMap == "map1")
			this.mapColor = "black"
		else if (gameMap == "map2") {
			this.mapColor = 'yellow'
		}
		else if (gameMap == "map3") {
			this.mapColor = 'green'
		}
	}
}

export class Ball {
    posX : number
    posY : number
    directionX : number
    directionY : number
    speed : number
    radius : number
    old_x: number
	old_y: number

    constructor(canvas : Canvas) {
        this.posX = canvas.width / 2
        this.posY = canvas.height / 2
        this.speed = 3
        this.directionX = random(0, 1) ? -this.speed : this.speed
        this.directionY = 0
        this.radius = 10;
        this.old_x = -1;
		this.old_y = -1;
    }

    reset(canvas: Canvas) {
		if (this.old_x < 0) {
			this.posX = canvas.width / 2
			this.posY = canvas.height / 2
		}
		else {
			this.posX = this.old_x
			this.posY = this.old_y
		}
		this.speed = 3
		this.directionX = random(0, 1) ? -this.speed : this.speed
		this.directionY = 0
		this.radius = 10
	}
}

function random(min: number, max: number): number {
	return (Math.floor(Math.random() * (max - min + 1)) + min)
}