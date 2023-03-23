import logger from "../logger.js";
import { BaseError } from "../errors/BaseError.js";

class ErrorHandler {
  public async handleError(err: Error): Promise<void> {
    if (err instanceof BaseError) {
      await logger.error("Caught an error: " + (err as BaseError));
    } else {
      await logger.error("Caught an error: " + err);
    }
  }

  public isOperationalError(error: Error) {
    if (error instanceof BaseError) {
      return error.isOperational;
    }
    return false;
  }
}
export const errorHandler = new ErrorHandler();
