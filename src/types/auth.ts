export interface User {
  id: string;
  name: string;
  email: string;
  avatarUri?: string | null;
}

export interface StoredUser extends User {
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
