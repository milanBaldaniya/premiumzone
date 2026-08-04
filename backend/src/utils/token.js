import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { TOKEN_TYPE } from '../constants/index.js';

const SECRETS = {
  [TOKEN_TYPE.ACCESS]: { secret: env.JWT_ACCESS_SECRET, expiresIn: env.JWT_ACCESS_EXPIRES_IN },
  [TOKEN_TYPE.REFRESH]: { secret: env.JWT_REFRESH_SECRET, expiresIn: env.JWT_REFRESH_EXPIRES_IN },
  [TOKEN_TYPE.EMAIL]: { secret: env.JWT_EMAIL_SECRET, expiresIn: '1d' },
  [TOKEN_TYPE.RESET]: { secret: env.JWT_RESET_SECRET, expiresIn: '30m' },
};

export const signToken = (payload, type = TOKEN_TYPE.ACCESS, options = {}) => {
  const { secret, expiresIn } = SECRETS[type];
  return jwt.sign(payload, secret, { expiresIn, ...options });
};

export const verifyToken = (token, type = TOKEN_TYPE.ACCESS) => {
  const { secret } = SECRETS[type];
  return jwt.verify(token, secret);
};

export const generateAuthTokens = (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    accessToken: signToken(payload, TOKEN_TYPE.ACCESS),
    refreshToken: signToken({ sub: user._id.toString() }, TOKEN_TYPE.REFRESH),
  };
};

/** Random opaque token (email verify / password reset stored hashed in DB). */
export const generateRandomToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
};

export const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');
