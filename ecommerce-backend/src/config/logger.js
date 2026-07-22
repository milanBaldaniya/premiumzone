import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env, isProd } from './env.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => `${ts} ${level}: ${stack || message}`)
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const transports = [new winston.transports.Console()];

if (isProd) {
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    })
  );
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'test' ? 'error' : 'info',
  format: isProd ? prodFormat : devFormat,
  transports,
  exitOnError: false,
});

// Morgan stream adapter
export const morganStream = {
  write: (message) => logger.http?.(message.trim()) ?? logger.info(message.trim()),
};
