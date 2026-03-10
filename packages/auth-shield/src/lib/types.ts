import { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload extends JwtPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface TokenOptions {
  secret: string;
  expiresIn: string | number;
}

export type HashResult = string;
