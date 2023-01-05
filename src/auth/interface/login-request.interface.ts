import { PassportRequest } from 'src/@types/passport-request';
import { User } from 'src/user/entities/user.entity';

export type PassportJwtRequest = PassportRequest<User>;

export type PassportLocalRequest = PassportRequest<User>;
