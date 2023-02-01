import { Exclude } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('increment')
  @Exclude()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => User, (user) => user.messages)
  user: User;

  @CreateDateColumn()
  createAt: Date;
}
