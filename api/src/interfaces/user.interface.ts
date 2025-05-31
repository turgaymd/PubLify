export interface IUser {
  id: string;
  full_name: string;
  username: string;
  email: string;
  is_banned: boolean;
  is_admin: boolean;
  password: string;
  created_at: Date;
}

export interface INewUser {
  full_name: string;
  username: string;
  email: string;
  password: string;
}
