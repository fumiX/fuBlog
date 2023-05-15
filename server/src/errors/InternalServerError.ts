import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

/**
 * HTTP error [500: Internal Server Error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500)
 */
export class InternalServerError extends BaseError {
  constructor(isOperational = true, description = "Internal server error") {
    super(HttpStatusCode.INTERNAL_SERVER, description, isOperational);
  }
}
