import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

/**
 * HTTP error [403: Forbidden](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403).
 *
 * Use this for when a user lacks permissions to do something.
 * If there are no (or incomplete) credentials, so the logged-in user can't even
 * be determined, then use {@link UnauthorizedError} instead.
 */
export class ForbiddenError extends BaseError {
  constructor(description = "Forbidden") {
    super(HttpStatusCode.FORBIDDEN, description, true);
  }
}
