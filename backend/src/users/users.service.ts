import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UserCredentialsDto} from './dto/user-credentials.dto';
import * as bcrypt from 'bcrypt';
import {User} from 'src/entities/user.entity';
import {Game} from 'src/entities/game.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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

    const games = users.find(
      (u) => u.username === user.username,
    ).games;

    return { games };
  }

  async getMatchHistory(id: string, user: User): Promise<{ games: Game[] }> {
    const found = await this.usersRepository.findOneBy({ id });
    if (found)
      return this.getGames(found);
    return null;
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

  async getUserByLogin(username: string): Promise<User> {
    const found = await this.usersRepository.findOneBy({ username });
    if (found)
      return found;
    return null;
  }

  async patchUsername(id: string, user: User, username: string): Promise<User> {
    const found = await this.getUserById(id, user);
    console.log(found);
    if (found)
      {
        found.username = username;
        await this.usersRepository.save(found);
        return found;
      }
      return null;
  }

  async activate2FA(user: User): Promise<void> {
    user.twoFactorAuth = true;
    this.usersRepository.save(user);
  }

  async get2FA(user: User): Promise<{ twoFactorAuth: boolean }> {
    return { twoFactorAuth: user.twoFactorAuth };
  }
}
