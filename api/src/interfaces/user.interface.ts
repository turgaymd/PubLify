import { Provider } from '../enums/provider.enum';

export interface IUser {
  id: string;
  full_name: string;
  username: string;
  email: string;
  is_banned: boolean;
  is_admin: boolean;
  provider: Provider;
  password: string;
  resetToken: string;
  resetTokenExpiration: Date;
  created_at: Date;
}

export interface INewUser {
  full_name: string;
  username: string;
  email: string;
  password: string;
  provider?: Provider;
}
