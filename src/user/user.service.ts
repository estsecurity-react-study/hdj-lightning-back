import { Injectable } from '@nestjs/common';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { ChangePasswordDto } from './dtos/changePassword.dto';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateProfileDto } from './dtos/updateProfile.dto';
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

  async updateProfile(user: User, updateProfileDto: UpdateProfileDto) {
    // TODO: 로직 추가
    const _user = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (!_user) {
      throw new NotFoundException();
    }

    // TODO: password 이슈 때문에 update 사용했는데, updateAt 반영이 안됌.
    return await this.userRepository.update(user.id, {
      ..._user,
      ...updateProfileDto,
    });
  }

  // TODO: validation controller -> Entity Transform 으로 변경
  async changePassword(
    user: User,
    { password: newPassword }: ChangePasswordDto,
  ) {
    const _user = await this.findOne({ where: { email: user.email } });

    if (!_user) {
      throw new NotFoundException();
    }

    // TODO: 해당 로직 Entity 단으로 리팩토링
    if (_user.password === newPassword) {
      throw new UnprocessableEntityException('패스워드가 동일합니다.');
    }

    await this.userRepository.save(
      this.userRepository.create({ ..._user, password: newPassword }),
    );
  }
}
