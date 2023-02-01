import { Controller, Get} from '@nestjs/common';
import { FriendShipService } from './friendShip.service';

@Controller('friend-ship')
export class FriendShipController {
  constructor(private friendRequestService: FriendShipService) {}

  @Get()
  findAll() {
    return this.friendRequestService.findAll();
  }

}