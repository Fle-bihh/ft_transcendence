import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/entities/channel.entity';
import { Message } from 'src/entities/message.entity';
import { Repository } from 'typeorm';
import { ChannelsDto } from './dto/messages.dto';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async getAllChannels() {
    const ret = await this.channelsRepository.find();

    return ret;
  }

  async getChannelMessages(name: string) {
    const ret = await this.messagesRepository.find({
      where: [{ receiver: name }]
    })
  }

  async findChannel(name: string) {
    const ret = await this.channelsRepository.find({
      where: [{ name: name }],
    });

    return ret;
  }

  async addChannel(data: ChannelsDto) {
    const newChannel = {
      name: data.name,
      privacy: data.privacy,
      description: data.description,
      password: data.password,
      owner: data.owner,
    };

    const ret = await this.channelsRepository.save(newChannel);

    return ret;
  }
}
