import winston, { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file/index.js";

const dateFormat = () => {
  return new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    minute: "numeric",
    second: "numeric",
    hour: "2-digit",
  });
};

const uncolored = format.combine(
  format.timestamp({ format: dateFormat }),
  format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  }),
);

export const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), uncolored),
    }),
    new winston.transports.DailyRotateFile({
      dirname: "logs",
      filename: "node-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "7d",
      format: uncolored,
    }),
  ],
});

export default logger;
