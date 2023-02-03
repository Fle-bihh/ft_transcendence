import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import * as bcrypt from 'bcrypt';
import {User} from 'src/entities/user.entity';
import {Game} from 'src/entities/game.entity';
import { Message } from 'src/entities/message.entity';
import { MessagesDto } from 'src/channel/dto/messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async findAll() {
    
    const ret = await this.messagesRepository.find();

    return ret;
  }

  async findConvers(login1: string, login2: string) {
    
    const ret = await this.messagesRepository.find({where: [
      { receiver: login1, sender: login2 },
      { receiver: login2, sender: login1 }
    ]});

    return ret;
  }

  async addMessage(data: MessagesDto) {
    const newMessage = {
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
      date: data.date,
    }

    const ret = await this.messagesRepository.save(newMessage);

    return ret;
  }
  



}
