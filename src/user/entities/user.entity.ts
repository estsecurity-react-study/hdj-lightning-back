import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  DeleteDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum Provider {
  LOCAL = 'local',
  GOOGLE = 'google',
  NAVER = 'naver',
  KAKAO = 'kakao',
}

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  username: string;

  @Column()
  @IsEnum(Provider)
  @Exclude()
  provider: Provider;

  @Column()
  @IsString()
  @Exclude()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    const HASH_SALT = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, HASH_SALT);
  }

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  @Exclude()
  deleteAt: Date | null;
}
