import { Injectable } from '@nestjs/common';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { Provider, User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  findOne(option: FindOneOptions<User>) {
    return this.userRepository.findOne(option);
  }

  async createUser(
    { email, password, username, photo }: CreateUserDto,
    provider: Provider,
  ) {
    // TODO: class validator로 대체
    try {
      const _user = await this.userRepository.findOne({ where: { email } });
      if (_user) {
        throw new ConflictException('이미 사용중인 email입니다.');
      }

      const newUser = this.userRepository.create({
        email,
        password,
        username,
        provider,
        photo,
      });
      return this.userRepository.save(newUser);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto) {
    // TODO: 로직 추가
    const _user = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (!_user) {
      throw new NotFoundException();
    }

    await this.userRepository.save(
      this.userRepository.create({ ..._user, ...updateUserDto }),
    );
    return;
  }
}
