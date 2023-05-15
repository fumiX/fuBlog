import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

/**
 * HTTP error [400: Bad request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400)
 */
export class BadRequestError extends BaseError {
  constructor(description = "Bad request") {
    super(HttpStatusCode.BAD_REQUEST, description, true);
  }
}
