import winston from 'winston';

export function configureLogger() {
  winston.configure({
    levels: winston.config.syslog.levels,
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize({ message: true }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.splat(),
      winston.format.printf((info) => `[${info.timestamp}] ${info.message}`),
    ),
  });
}
