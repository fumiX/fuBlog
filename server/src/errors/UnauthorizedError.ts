import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

/**
 * HTTP error [401: Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401).
 *
 * Use this for when no (or incomplete) credentials are provided.
 * If there are credentials, but not enough permissions, use {@link ForbiddenError} instead.
 */
export class UnauthorizedError extends BaseError {
  constructor(description = "Unauthorized") {
    super(HttpStatusCode.UNAUTHORIZED, description, true);
  }
}
