import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";
import { User } from "./user.entity";

@Entity()
export class Channel {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	privacy: boolean;

	@Column({ unique: true })
	name: string;

	@Column()
	password: string;

	@Column()
	description: string;

	@ManyToOne(type => User, user => user.channels, { nullable: true })
	creator: User | null;

	@ManyToMany(type => User, user => user.channelsAdmin, { cascade: true })
	@JoinTable()
	admin: User[];

	@OneToMany(type => Message, message => message.channel)
	messages: Message[];

	@ManyToMany(type => User, user => user.channelsConnected, { cascade: true })
	@JoinTable()
	userConnected: User[];
}
