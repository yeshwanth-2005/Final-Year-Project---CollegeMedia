import jwt, { SignOptions, Secret } from 'jsonwebtoken';

// Cast environment variables to Secret type for better type safety
const ACCESS_SECRET = (process.env.JWT_ACCESS_SECRET || 'dev_access_secret') as Secret;
const REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret') as Secret;

// Base token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export function signAccessToken(payload: object) {
  const options: SignOptions = { 
    expiresIn: '15m' as unknown as SignOptions['expiresIn'] 
  };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function signRefreshToken(payload: object) {
  const options: SignOptions = { 
    expiresIn: '7d' as unknown as SignOptions['expiresIn'] 
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyAccessToken<T = TokenPayload>(token: string): T {
  try {
    return jwt.verify(token, ACCESS_SECRET) as T;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

export function verifyRefreshToken<T = TokenPayload>(token: string): T {
  try {
    return jwt.verify(token, REFRESH_SECRET) as T;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
