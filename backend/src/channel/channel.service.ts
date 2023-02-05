import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Channel } from 'src/entities/channel.entity';
import { Message } from 'src/entities/message.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { MessagesDto } from './dto/messages.dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async getGames() {
    const query = this.channelsRepository.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.creator', 'creator')
      .leftJoinAndSelect('channel.admin', 'admin')
      .leftJoinAndSelect('channel.userConnected', 'userConnected')
      .leftJoinAndSelect('channel.messages', 'messages')

    const channels = await query.getMany();
    return channels;
  }

  async createChannel(user: User, name: string, password: string, description: string, privacy: string): Promise<Channel> {

    let hashedPassword: string = "";

    if (password !== "") {
      const salt: string = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const channel: Channel = this.channelsRepository.create({
      privacy: privacy,
      name: name,
      password: hashedPassword,
      description: description,
      creator: user,
      admin: [],
      messages: [],
      userConnected: [],
    })

    channel.admin.push(user);
    channel.userConnected.push(user);

    user.channels = (await this.userService.getChannelsCreator(user)).channels;
    user.channels.push(channel);

    user.channelsAdmin = (await this.userService.getChannelsAdmin(user)).channelsAdmin;
    user.channelsAdmin.push(channel);

    user.channelsConnected = (await this.userService.getChannelsConnected(user)).channelsConnected;
    user.channelsConnected.push(channel);

    try {
      await this.channelsRepository.save(channel);
    } catch (e) { console.log(e.code) }
    return channel;
  }

  async getChannel(): Promise<Channel[]> {
    const query = this.channelsRepository.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.creator', 'creator')
      .leftJoinAndSelect('channel.admin', 'admin')
      .leftJoinAndSelect('channel.userConnected', 'userConnected')
      .leftJoinAndSelect('channel.messages', 'messages')

    const channels = await query.getMany();

    return channels;
  }

  async getOneChannel(id: string): Promise<Channel> {
    let found: Channel = (await this.getChannel()).find((channel) => channel.name === id);
    return found;
  }

  async joinChannel(username: string, channelName: string, password: string) {
    let channel: Channel = await this.getOneChannel(channelName);

    if (channel && (channel.password === "" || await bcrypt.compare(password, channel.password))) {
      let user: User = await this.userService.getUserByUsername(username);
      channel.userConnected.push(user);

      user.channelsConnected = (await this.userService.getChannelsConnected(user)).channelsConnected;
      user.channelsConnected.push(channel);
      try {
        await this.channelsRepository.save(channel);
      } catch (e) { console.log(e.code) }
      //join the channel}
    } else {
      throw new UnauthorizedException('Wrong password');
    }
  }

  async promoteAdmin(user: User, channel: Channel) {
    channel.admin.push(user);

    try {
      await this.channelsRepository.save(channel)
    } catch (e) { console.log(e.code) }
  }

  async demoteAdmin(user: User, channel: Channel) {
    channel.admin.splice(channel.admin.findIndex((u) => u.username === user.username), 1);

    try {
      await this.channelsRepository.save(channel)
    } catch (e) { console.log(e.code) }
  }

  async changeName(currentName: string, newName: string) {
    let found = await this.getOneChannel(currentName);

    if (found) {
      found.name = newName;
      this.channelsRepository.save(found);
    }
    else
      throw new NotFoundException('Channel not found');
  }

  async changePassword(channelName: string, newPassword: string) {
    let found = await this.getOneChannel(channelName);
    let hashedPassword = "";

    if (found) {
      if (newPassword !== "") {
        const salt: string = await bcrypt.genSalt();
        hashedPassword = await bcrypt.hash(newPassword, salt);
      }
      found.password = hashedPassword;
      this.channelsRepository.save(found);
    }
    else
      throw new NotFoundException('Channel not found');
  }

  async leaveChannel(username: string, channelName: string) {
    let user = await this.userService.getUserByUsername(username);
    let channel = await this.getOneChannel(channelName);

    user.channels.splice(user.channels.findIndex((c) => c.name === channel.name), 1);
    user.channelsConnected.splice(user.channelsConnected.findIndex((c) => c.name === channel.name), 1);
    user.channelsAdmin.splice(user.channelsAdmin.findIndex((c) => c.name === channel.name), 1);
    channel.admin.splice(channel.admin.findIndex((u) => u.username === user.username), 1);
    channel.userConnected.splice(channel.userConnected.findIndex((u) => u.username === user.username), 1);
    if (channel.creator.username === user.username)
      channel.creator = null;
    this.usersRepository.save(user);
    this.channelsRepository.save(channel);
  }

  async getMessages(): Promise<Message[]> {
    const query = this.messagesRepository.createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .leftJoinAndSelect('message.channel', 'channel')

    const messages = await query.getMany();

    return messages;
  }

  async getMessageByChannel(name: string): Promise<{ messages: Message[] }> {
    const allMessages = await this.getMessages();

    let messages: Message[] = [];
    for (let message of allMessages) {
      if (message.channel && message.channel.name === name) {
        messages.push(message);
      }
    }
    return { messages };
  }

  async getConvByChannel(name: string) {
    const allMessages = await this.getMessages();

    let messages = new Array<{ sender: string, receiver: string, content: string, time: Date }>();
    for (let message of allMessages) {
      if (message.channel && message.channel.name === name) {
        messages.push({ sender: message.sender.username, receiver: message.channel.name, content: message.body, time: message.date });
      }
    }
    return messages;
  }

  async getChannelAdmins(channel: Channel): Promise<Array<string>> {
    let retArray: Array<string>;

    for (let admin of channel.admin)
      retArray.push(admin.username);
    return retArray;
  }

  async createMessage(sender: User, message: MessagesDto) {
    const msg: Message = this.messagesRepository.create({
      body: message.body,
      date: message.date,
      sender: sender,
      receiver: message.receiver,
      channel: message.channel
    });

    sender.messagesSent = (await this.userService.getMessages(sender.id)).messagesSent;
    sender.messagesSent.push(msg);

    if (message.receiver) {
      message.receiver.messagesReceived = (await this.userService.getMessages(message.receiver.id)).messagesReceived;
      message.receiver.messagesReceived.push(msg);
    }

    if (message.channel) {
      message.channel.messages = (await this.getMessageByChannel(message.channel.name)).messages;
      message.channel.messages.push(msg);
    }

    try {
      await this.messagesRepository.save(msg);
      await this.usersRepository.save(sender);
    } catch (e) { console.log(e.code); }
  }

  async addAdmin(newAdmin: string, channel: Channel): Promise<void> {
    const user: User = await this.userService.getUserByUsername(newAdmin);
    for (let u of channel.userConnected) {
      if (u.username === user.username)
        this.promoteAdmin(user, channel);
    }
  }

  async removeAdmin(user: User, channel: Channel): Promise<void> {
    if (channel.creator.username === user.username) {
      return
    }
    channel.admin.splice(channel.admin.findIndex((u) => u.username === user.username));
    await this.channelsRepository.save(channel);
  }

  async kickUser(user: User, channel: Channel): Promise<void> {
    channel.userConnected.splice(channel.userConnected.findIndex((u) => u.username === user.username));
    await this.channelsRepository.save(channel);
  }


}
