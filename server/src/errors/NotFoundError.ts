import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

/**
 * HTTP error [404: Not Found](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404)
 */
export class NotFoundError extends BaseError {
  constructor(description = "Not found") {
    super(HttpStatusCode.NOT_FOUND, description, true);
  }
}
