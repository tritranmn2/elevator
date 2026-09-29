import { Injectable, LoggerService } from '@nestjs/common';
import moment from 'moment';
import winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: winston.Logger;

  public logLevels = {
    levels: { fatal: 0, error: 1, info: 2, debug: 3 },
    colors: {
      fatal: 'magenta',
      error: 'red',
      info: 'green',
      debug: 'blue',
    },
  };

  constructor() {
    const messageFormat = winston.format.printf(({ level, message, timestamp }) => {
      const purpleTimestamp = `[\x1b[35m${moment(timestamp as string).format(
        'YYYY-MM-DD HH:mm:ss',
      )}\x1b[0m]`;

      let info: any;
      try {
        info = JSON.parse(message as string);
      } catch {
        info = { message };
      }

      const messageRender = info.message?.message || info.message || message;
      const clientIp = info.message?.clientIp;

      if (clientIp) {
        return `${purpleTimestamp} - [${level}] - [\x1b[33m${clientIp}\x1b[0m] - ${messageRender}`;
      }
      return `${purpleTimestamp} - [${level}] - ${messageRender}`;
    });

    const timezoned = () => moment().format();
    const { combine, colorize, timestamp, splat, align } = winston.format;

    // 1. Log ra Console khi chạy local / dev
    const consoleTransporter = new winston.transports.Console({
      level: 'debug',
      format: combine(
        colorize(this.logLevels),
        timestamp({ format: timezoned }),
        align(),
        splat(),
        messageFormat,
      ),
    });

    // 2. Ghi file quay vòng hàng ngày (Rotate File)
    const infoFileTransporter = new winston.transports.DailyRotateFile({
      level: 'info',
      format: combine(timestamp({ format: timezoned }), align(), splat(), messageFormat),
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // giữ log 14 ngày
      zippedArchive: true,
    });

    const errorFileTransporter = new winston.transports.DailyRotateFile({
      level: 'error',
      format: combine(timestamp({ format: timezoned }), align(), splat(), messageFormat),
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    });

    this.logger = winston.createLogger({
      levels: this.logLevels.levels,
      transports: [consoleTransporter, infoFileTransporter, errorFileTransporter],
    });
  }

  log(message: any) {
    this.info(message);
  }

  info(message: any) {
    this.logger.log({ level: 'info', message: JSON.stringify({ message }) });
  }

  error(message: any) {
    this.logger.log({ level: 'error', message: JSON.stringify({ message }) });
  }

  warn(message: any) {
    this.logger.log({ level: 'warn', message: JSON.stringify({ message }) });
  }

  debug(message: any) {
    this.logger.log({ level: 'debug', message: JSON.stringify({ message }) });
  }
}
