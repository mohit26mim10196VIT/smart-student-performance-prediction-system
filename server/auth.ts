import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

const SESSION_COOKIE = 'vityarthi_session';
const sessions = new Map<string, { username: string; expiresAt: number }>();

function getCookie(req: Request, name: string): string | undefined {
  const cookies = req.headers.cookie?.split(';') || [];
  const entry = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : undefined;
}

function getCredentials() {
  return {
    username: process.env.AUTH_USERNAME || 'admin',
    password: process.env.AUTH_PASSWORD || 'admin123'
  };
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function getAuthenticatedUser(req: Request) {
  const token = getCookie(req, SESSION_COOKIE);
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token);
    return null;
  }
  return { username: session.username };
}

export function login(username: string, password: string): string | null {
  const credentials = getCredentials();
  if (!safeEqual(username, credentials.username) || !safeEqual(password, credentials.password)) return null;
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { username, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
  return token;
}

export function setSessionCookie(res: Response, token: string) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`);
}

export function clearSessionCookie(res: Response) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export function logout(req: Request) {
  const token = getCookie(req, SESSION_COOKIE);
  if (token) sessions.delete(token);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!getAuthenticatedUser(req)) return res.status(401).json({ error: 'Authentication required' });
  next();
}