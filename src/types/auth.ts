export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthSession {
  user: AuthUser & {
    image?: string | null;
  };
  expires: string;
}
