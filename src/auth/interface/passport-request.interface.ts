import { Request } from 'express';
import { Provider, User } from 'src/user/entities/user.entity';

export interface SocialProfile {
  email: string;
  username: string;
  provider: Provider;
}

export interface PassportRequest<T> extends Request {
  user: T;
}

export type PassportJwtRequest = PassportRequest<User>;

export type PassportLocalRequest = PassportRequest<User>;

export type PassportSocialRequest = PassportRequest<SocialProfile>;
