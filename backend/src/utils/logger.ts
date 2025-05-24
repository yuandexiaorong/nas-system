import winston from 'winston';
import { join } from 'path';

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// 创建日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// 创建日志记录器
export const logger = winston.createLogger({
  levels,
  format,
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        format
      ),
    }),
    // 文件输出
    new winston.transports.File({
      filename: join('logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: join('logs', 'combined.log'),
    }),
  ],
});

// 开发环境下的额外配置
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// 导出日志工具
export default logger; 