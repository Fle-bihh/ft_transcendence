import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Index()
  public sender_id: string;

  @Column()
  @Index()
  public receiver_id: string;
}
