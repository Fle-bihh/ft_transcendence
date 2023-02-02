import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { FriendShip } from 'src/entities/friend-ship.entity';

@Injectable()
export class FriendShipService {
  constructor(
    @InjectRepository(FriendShip)
    private friendShipRepository: Repository<FriendShip>,
  ) {}

  async findAll(): Promise<FriendShip[]> {
    const ret = this.friendShipRepository.find();
    return ret;
  }

  async addFriendShip(id_1: string, id_2: string): Promise<FriendShip> {
    console.log('create friend ship', id_1, id_2)
    const ret = await this.friendShipRepository.save({id_1: id_1, id_2: id_2})
    return ret;
  }

  async getUserFriendList(id: string): Promise<FriendShip[]> {
    const ret = await this.friendShipRepository.find({
      where: [{ id_1: id }, { id_2: id }],
    });
    return ret;
  }

  async delFriendShip(id_1: string, id_2: string): Promise<DeleteResult> {
    const friendShip = await this.friendShipRepository.findOne({where: [{id_1: id_1, id_2: id_2} , {id_1: id_2, id_2: id_1}]});
    const ret = await this.friendShipRepository.delete({id: friendShip.id});
    return ret;
  }

}
