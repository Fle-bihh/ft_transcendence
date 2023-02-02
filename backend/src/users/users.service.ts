import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { Game } from 'src/entities/game.entity';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

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
    // const matchhistory = await this.gameRepository
    // .createQueryBuilder('game')
    // .leftJoinAndSelect('game.player1', 'player1')
    // .leftJoinAndSelect('game.player2', 'player2')
    // .leftJoinAndSelect('game.winner', 'winner')
    // .where(`(game.plater1Id = :id OR game.player2ID = :id)`, {id})
    // .getMany();
    // return matchhistory;
    const found = await this.usersRepository.findOneBy({ id });
    if (found)
      return this.getGames(found);
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
    console.log(login);
    const found = await this.usersRepository.findOneBy({ login });
    console.log(found);
    if (found == null) {
      throw new HttpException('User Not Found', 404);
    }
    return found;
  }

  async getUserByUsername(username: string): Promise<User> {
    const found = await this.usersRepository.findOneBy({ username });
    if (found == null) {
      throw new HttpException('User Not Found', 404);
    }
    return null;
  }

  async patchUsername(id: string, user: User, username: string): Promise<User> {
    const found = await this.getUserById(id, user);
    if (found) {
      found.username = username;
      await this.usersRepository.save(found);
      return found;
    }
    return null;
  }

  async patchProfileImage(id: string, user: User, profileImage: string) {
    const found = await this.getUserById(id, user);
    console.log(profileImage);
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
    const secret = await authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(user.login, 'ft_transcendence', secret);
    await this.setTwoFactorAuthenticationSecret(secret, user.id);

    return {
      secret,
      otpAuthUrl
    }
  }

  async deactivate2FA(user: User): Promise<User> {
    user.twoFactorAuth = false;
    return await this.usersRepository.save(user);
  }

  async activate2FA(user: User): Promise<User> {
    user.twoFactorAuth = true;
    return await this.usersRepository.save(user);
  }

  async get2FA(user: User): Promise<{ twoFactorAuth: boolean }> {
    return { twoFactorAuth: user.twoFactorAuth };
  }
}
