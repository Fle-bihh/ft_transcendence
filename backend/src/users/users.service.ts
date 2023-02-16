import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { Game } from 'src/entities/game.entity';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { Channel } from 'src/entities/channel.entity';
import { Message } from 'src/entities/message.entity';
import { validate, Validate } from 'class-validator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private configService: ConfigService,
  ) { }
  private readonly ip: string = this.configService.get('IP');

  async signUp(userCredentialsDto: UserCredentialsDto): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userCredentialsDto.password, salt);
    userCredentialsDto.password = hashedPassword;
    try {
      await this.usersRepository.save(userCredentialsDto);
    }
    catch (error) {
      if (error.code === '23505') { // duplicate username
        throw new ConflictException('Username already exists');
      }
      else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getGames(user: User): Promise<{ games: Game[] }> {
    const users = await this.usersRepository.find({
      relations: ['games'],
    });

    if (users) {
      const games = users.find(
        (u) => u.username === user.username,
      ).games;
      return { games };
    }
    return null;
  }

  async getMatchHistory(id: string, user: User) {
    const found = await this.usersRepository.findOneBy({ id });
    if (found) {
      return await this.getGames(found);
    }
    return null;
  }

  async getAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async getUserById(id: string, user?: User): Promise<User> {
    if (id === 'me') {
      id = user.id;
    }
    const found = await this.usersRepository.findOneBy({ id });
    if (found)
      return found;
    return null;
  }

  async getUserByLogin(login: string): Promise<User> {
    const found = await this.usersRepository.findOneBy({ login });
    if (found === null) {
      throw new HttpException('User Not Found', 404);
    }
    return found;
  }

  async getUserByUsername(username: string): Promise<User> {
    try {
      const found = await this.usersRepository.findOneBy({ username });
      if (found)
        return found;
      else 
        throw new HttpException('User Not Found', 404);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async patchUsername(id: string, user: User, username: string): Promise<User> {
    let found = await this.getUserById(id, user);
    let regex = /[a-zA-Z0-9_]/g;
    if (username.match(regex).length == username.length) {
    found.username = username
    if (username.length > 12)
      throw new InternalServerErrorException('Username must be shorter or equal to 12 characters');
    if (found) {
      try {
        await this.usersRepository.save(found);
      } catch (e) {
        if (e.code === '23505') {
          throw new InternalServerErrorException('Username already exists');
        }
      }
      found = await this.getUserByUsername(username);
      return found;
    } 
  }
  else
    throw new InternalServerErrorException("Invalid username");
  }

  async patchProfileImage(id: string, user: User, profileImage: string) {
    const found = await this.getUserById(id, user);
    if (found) {
      found.profileImage = profileImage;
      await this.usersRepository.save(found);
      return found;
    }
    return null;
  }

  isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return await toDataURL(otpAuthUrl);
  }

  async setTwoFactorAuthenticationSecret(secret: string, id: string) {
    const user: User = await this.getUserById(id);
    user.twoFactorAuthenticationSecret = secret;
    await this.usersRepository.save(user);
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(user.login, 'ft_transcendence', secret);
    await this.setTwoFactorAuthenticationSecret(secret, user.id);

    return { secret, otpAuthUrl };
  }

  async deactivate2FA(user: User): Promise<User> {
    user.twoFactorAuth = false;
    user = await this.usersRepository.save(user);
    return (user);
  }

  async activate2FA(user: User): Promise<User> {
    user.twoFactorAuth = true;
    return await this.usersRepository.save(user);
  }

  async get2FA(user: User): Promise<{ twoFactorAuth: boolean }> {
    return { twoFactorAuth: user.twoFactorAuth };
  }

  async getBlockList(user: User): Promise<{ blockList: User[] }> {
    const allUser = await this.usersRepository.find({
      relations: ['blockList'],
    });

    const blockList = allUser.find((u) => {
      return u.username === user.username;
    }).blockList;

    return { blockList: blockList };
  }

  async isBlocked(username: string, target: string): Promise<boolean> {
    const targetUser: User = await this.getUserByUsername(target);
    const user: User = await this.getUserByUsername(username);

    user.blockList = (await this.getBlockList(user)).blockList;
    if (user.blockList && user.blockList.length > 0 && user.blockList.find((u) => u.username === targetUser.username))
      return true;
    return false;
  }

  async removeBlocklist(username: string, target: string): Promise<void> {
    const targetUser: User = await this.getUserByUsername(target);
    const user: User = await this.getUserByUsername(username);

    user.blockList = (await this.getBlockList(user)).blockList;
    user.blockList.splice(user.blockList.findIndex((u) => u.username === targetUser.username));

    await this.usersRepository.save(user);
  }

  async addBlockList(username: string, target: string): Promise<void> {
    const targetUser: User = await this.getUserByUsername(target);
    const user: User = await this.getUserByUsername(username);

    user.blockList = (await this.getBlockList(user)).blockList;
    user.blockList.push(targetUser);
    targetUser.blockList = (await this.getBlockList(targetUser)).blockList;
    targetUser.blockList.push(user);

    await this.usersRepository.save(user);
    await this.usersRepository.save(targetUser);
  }

  async getChannelsCreator(user: User): Promise<{ channels: Channel[] }> {
    const allCreator = await this.usersRepository.find({
      relations: ['channels'],
    });

    const channels = allCreator.find((u) => u.username === user.username).channels;
    return { channels };
  }

  async getChannelsAdmin(user: User): Promise<{ channelsAdmin: Channel[] }> {
    const allAdmin = await this.usersRepository.find({
      relations: ['channelsAdmin'],
    });

    const channelsAdmin = allAdmin.find((u) => u.username === user.username).channelsAdmin;
    return { channelsAdmin };
  }

  async getChannelsConnected(user: User): Promise<{ channelsConnected: Channel[] }> {
    const allConnected = await this.usersRepository.find({
      relations: ['channelsConnected'],
    });

    const channelsConnected = allConnected.find((u) => u.username === user.username).channelsConnected;
    return { channelsConnected };
  }

  async getMessages(id: string): Promise<{ messagesSent: Message[], messagesReceived: Message[] }> {
    const found = await this.getUserById(id);
    const allMessages = await this.usersRepository.find({
      relations: ['messagesSent', 'messagesReceived'],
    });

    const messagesSent = allMessages.find((user) => {
      return user.username === found.username
    }).messagesSent;

    const messagesReceived = allMessages.find((user) => {
      return user.username === found.username
    }).messagesReceived;
    return { messagesSent, messagesReceived };
  }

  async getMessage() {
    const messages = this.messageRepository.createQueryBuilder("message")
      .leftJoinAndSelect("message.sender", "sender")
      .leftJoinAndSelect("message.receiver", "receiver")
    return await messages.getMany();
  }

  async getConv(user: User, receiver: User) {
    let conv = new Array<{ sender: string, receiver: string, content: string, time: Date, serverMsg: boolean }>();

    const messages = await this.getMessage();

    for (const message of messages) {
      if ((user.username === message.receiver?.username && receiver.username === message.sender?.username) || (user.username === message.sender?.username && receiver.username === message.receiver?.username))
        conv.push({ sender: message.sender.username, receiver: message.receiver.username, content: message.body, time: message.date, serverMsg: message.serverMsg });
    }
    return conv;
  }
  async checkMagicNumber(type: string, buffer: Buffer) {
    if (type == 'image/jpg' || type == 'image/jpeg') {
      if (buffer.toString('hex').length < "ffd8ff".length) {
        return false;
      }
      if (buffer.toString('hex').substring(0, 6) == "ffd8ff")
        return true;
    }
    else if (type == 'image/png') {
      if (buffer.toString('hex').length < "89504e47".length) {
        return false;
      }
      if (buffer.toString('hex').substring(0, 8) == "89504e47")
        return true;
    }
    return false;
  }

  async updateProfilePic(id, filename: string, headers): Promise<User> {
    const user = await this.getUserById(id);
    if (!user)
      return null;

    user.profileImage = `http://${this.ip}:5001/user/profilePic/:${filename}`;
    this.usersRepository.save(user);

    return user;
  }
}
