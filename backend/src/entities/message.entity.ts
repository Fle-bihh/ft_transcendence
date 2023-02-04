import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

@Entity()
export class Message {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	body: string;

	@Column()
	date: Date;

	@ManyToOne(type => User, user => user.messagesSent, { cascade: false })
	sender: User;

	@ManyToOne(type => User, user => user.messagesReceived, { nullable: true, cascade: false })
	receiver: User | null;

	@ManyToOne(type => Channel, channel => channel.messages, { nullable: true })
	channel: Channel | null;
}
