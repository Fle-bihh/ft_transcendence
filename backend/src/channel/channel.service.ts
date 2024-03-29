import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    private readonly userService: UsersService,
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async createChannel(user: User, name: string, password: string, description: string, privacy: boolean): Promise<Channel> {

    let hashedPassword: string = "";

    if (password !== "") {
      const salt: string = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);
    }
    try {
      let userExist: User = await this.userService.getUserByUsername(name);
      if (userExist) {
        name = name + Math.floor(Math.random() * 9000);
      }
    }
    catch {}

    const channel: Channel = this.channelsRepository.create({
      privacy: privacy,
      name: name,
      password: hashedPassword,
      description: description,
      creator: user,
      admin: [user],
      messages: [],
      userConnected: [user],
    })

    // this.channelsRepository.save(channel);

    try {
      await this.channelsRepository.save(channel);
      await this.usersRepository.save(user);
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
    let found: Channel;
    try {
      
      found = (await this.getChannel()).find((channel) => channel.name === id);
      return found;
    } catch (error) {
      return found;
    }
  }

  async joinChannel(username: string, channelName: string, password: string) {
    console.log("join channel ===", channelName);
    let channel: Channel = await this.getOneChannel(channelName);

    if (channel && (channel.password === "" || await bcrypt.compare(password, channel.password))) {
      let user: User = await this.userService.getUserByUsername(username);
      channel.userConnected.push(user);
      if (channel.admin.length === 0) {
        channel.admin.push(user);
      if (channel.creator === null)
        channel.creator = user;
      }
      try {
        await this.channelsRepository.save(channel);
      } catch (e) { console.log(e.code) }
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

  async changeName(currentName: string, newName: string) {
    let found = await this.getOneChannel(currentName);
    try {
      await this.userService.getUserByUsername(newName)
      return null;
    } catch (e) {
    if (found) {
        found.name = newName;
        await this.channelsRepository.save(found);
        return found;
    }
  }
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

    // user.channelsConnected.splice(user.channelsConnected.findIndex((c) => c.name === channel.name), 1);
    // user.channelsAdmin.splice(user.channelsAdmin.findIndex((c) => c.name === channel.name), 1);
    if (channel.admin.findIndex((u) => u.username === user.username) != -1)
      channel.admin.splice(channel.admin.findIndex((u) => u.username === user.username), 1);
    channel.userConnected.splice(channel.userConnected.findIndex((u) => u.username === user.username), 1);
    if (channel.creator.username === user.username) {
      channel.creator = null;
      if (channel.userConnected.length !== 0)
        channel.creator = channel.userConnected[0];
      if (channel.admin.length === 0) {
        channel.admin.push(channel.userConnected[0]);
      }
    }
    // this.usersRepository.save(user);
    this.channelsRepository.save(channel);
  }

  async getMessages(): Promise<Message[]> {
    const query = this.messagesRepository.createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .leftJoinAndSelect('message.channel', 'channel')
      .orderBy('date', 'DESC')

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

    let messages = new Array<{ sender: string, receiver: string, content: string, time: Date, serverMsg: boolean }>();
    for (let message of allMessages) {
      if (message.channel && message.channel.name === name) {
        messages.push({ sender: message.sender.username, receiver: message.channel.name, content: message.body, time: message.date, serverMsg: message.serverMsg });
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
    const msg: Message =this.messagesRepository.create({
      body: message.body,
      date: message.date,
      sender: message.sender,
      receiver: message.receiver,
      channel: message.channel,
      serverMsg: message.serverMsg
    });
    console.log("sender dans create message == ", sender);
    console.log("create sender = ", sender.username)
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
    channel.admin.splice(channel.admin.findIndex((u) => u.username === user.username), 1);
    try {
      await this.channelsRepository.save(channel)
    } catch (e) { console.log(e.code) }
  }

  async kickUser(user: User, channel: Channel): Promise<void> {
    if (channel.creator.username === user.username)
      return
    channel.userConnected.splice(channel.userConnected.findIndex((u) => u.username === user.username), 1);
    await this.channelsRepository.save(channel);
  }

  async isAdmin(user: User, channel: Channel): Promise<boolean> {
    return (channel.admin.find((u) => u.username === user.username) ? true : false);
  }
}
