import {MinLength} from "@nestjs/class-validator";
import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Channel} from "./channel.entity";
import {FriendRequest} from "./friend-request.entity";
import {Game} from "./game.entity";
import {Message} from "./message.entity";

@Entity()
export class User {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({ unique: true })
username: string;

@Column({nullable: true})
password?: string | null;

@Column()
firstName: string;

@Column()
lastName: string;

@Column({nullable: true})
nickName?: string | null;

@Column({nullable: true})
profileImage?: string | null;

@Column()
email: string;

@Column({default: 0})
GoalTaken: number;

@Column({default: 0})
GoalSet: number;

@Column({default: 0})
NormalGameNumber: number;

@Column({default: 0})
NormalWinNumber: number;

@Column({ default: 0 })
NormalLossNumber: number;

@Column({default: false})
twoFactorAuth: boolean;

@Column({default: 0})
Friend: number;

@OneToMany(type => Game, games => games.player1 || games.player2)
games: Game[];

@OneToMany(type => FriendRequest, request => request.from)
requestFrom: FriendRequest[];

@OneToMany(type => FriendRequest, request => request.to)
requestTo: FriendRequest[];

@OneToMany(type => Message, message => message.sender)
messagesSend: Message[];

@OneToMany(type => Message, message => message.receiver)
messagesReceive: Message[];

@OneToMany(type => Channel, channel => channel.creator)
channels: Channel[];

@ManyToMany(type => Channel, channel => channel.admin)
channelsAdmin: Channel[];

@ManyToMany(type => Channel, channel => channel.userConnected)
channelsConnected: Channel[];

@ManyToMany(type => User, user => user.friends, {cascade: false})
@JoinTable()
friends: User[];

@ManyToMany(type => User, user => user.blackList, {cascade: false})
@JoinTable()
blackList: User[];
}