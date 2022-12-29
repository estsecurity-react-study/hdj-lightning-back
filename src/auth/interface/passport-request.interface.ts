import { Request } from 'express';
import { Profile } from 'passport-google-oauth20';
import { User } from 'src/user/entities/user.entity';

export interface PassportRequest<T> extends Request {
  user: T;
}

export type PassportJwtRequest = PassportRequest<User>;

export type PassportLocalRequest = PassportRequest<string>;

export type PassportGoogleRequest = PassportRequest<Profile>;
