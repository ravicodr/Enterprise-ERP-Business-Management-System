import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

export function authenticate(request: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    const user = authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden. Insufficient permissions.' },
        { status: 403 }
      );
    }
    
    return user;
  };
}
