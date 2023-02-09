import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { Game } from 'src/entities/game.entity';
import { FriendRequest } from 'src/entities/friend-request.entity';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
  ) { }

	async findAll(): Promise<FriendRequest[]> {
		return this.friendRequestRepository.find();
	}

	async getRelation(id_1: string, id_2: string): Promise<FriendRequest> {
		
		const ret = await this.friendRequestRepository.findOne({where: [
			{ receiver_id: id_1, sender_id: id_2 },
			{ receiver_id: id_2, sender_id: id_1 }
		]})
		return ret;
	}

	async addFriendRequest(sender_id: string, receiver_id: string): Promise<FriendRequest> {
		return await this.friendRequestRepository.save({sender_id: sender_id, receiver_id: receiver_id})
	}

	async delFriendRequest(id: number): Promise<boolean> {

		const res = await this.friendRequestRepository.delete({id: id});

		return true
	}

}
