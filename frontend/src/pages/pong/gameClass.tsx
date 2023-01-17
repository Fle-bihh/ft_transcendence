

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
        this.players.push(new Player("left", username, playerId))
		this.players.push(new Player("right"))
        this.KEYDOWN = "ArrowDown"
        this.KEYUP = "ArrowUp"
        this.KEYZ = "z"
        this.KEYS = "s"
        this.SPACEBAR = " "
    }

    setOponnent(id: string, username: string) {
		this.players[1].id = id
		this.players[1].username = username
		this.players[1].posX = this.canvas.width / 8 * 7 - this.players[1].width / 2
	}
}

export class Player {
    username : string
    id : string
    width : number
    height : number
    color : string
    posX : number
    posY : number
    goUp : boolean
    goDown : boolean
    score : number
    originalPosition : string
    ready : boolean

    constructor (position : string, username : string = "", id : string = ""){
        this.username = username
        this.id = id
        this.width = 10
        this.height = 50
        this.color = "#FFFFFF"
        this.goUp = false
        this.goDown = false
        this.score = 0
        this.originalPosition = position
        this.ready = false
        if (this.originalPosition == "left") {
            this.posX = 30
            this.posY = 200
        } else {
            this.posX = 650
            this.posY = 200
        }
    }
}

export class Map {

	mapColor: string

	constructor(gameMap: string) {
		this.mapColor = 'black'
		if (gameMap == 'custom') {
			this.mapColor = 'black'
			return
		}
		if (gameMap == 'map1')
			this.mapColor = 'red'
		else if (gameMap == 'map2') {
			this.mapColor = 'yellow'
		}
		else if (gameMap == 'map3') {
			this.mapColor = 'green'
		}
	}
}

export class Ball {
    width : number
    height : number
    color : string
    posX : number
    posY : number
    directionX : number
    directionY : number
    inGame : boolean
    speed : number
    radius : number

    constructor(canvas : Canvas) {
        this.width = 10
        this.height = 10
        this.color = "#FFFFFF"
        this.posX = canvas.width / 2
        this.posY = canvas.height / 2
        this.directionX = random(0, 1)
        this.directionY = 0
        this.inGame = false
        this.speed = 1
        this.radius = 10;
    }
}

function random(min: number, max: number): number {
	return (Math.floor(Math.random() * (max - min + 1)) + min)
}