import { PassportRequest } from 'src/@types/passport-request';
import { Provider } from 'src/user/entities/user.entity';

export interface SocialProfile {
  email: string;
  username: string;
  provider: Provider;
  photo: string;
}

export type PassportSocialRequest = PassportRequest<SocialProfile>;
