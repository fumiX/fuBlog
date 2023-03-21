import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({
      dirname: "logs",
      filename: "node.log",
    }),
  ],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({timestamp, level, message}) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
});

export default logger;
