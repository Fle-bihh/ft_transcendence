import {
	Column,
	Entity,
	Index,
	PrimaryGeneratedColumn,
  } from 'typeorm';
  
  @Entity()
  export class FriendShip {
	@PrimaryGeneratedColumn()
	public id: number;
  
	@Column()
	@Index()
	public id_1: string;
  
	@Column()
	@Index()
	public id_2: string;
  }
  