import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

/**
 * HTTP error [410: Gone](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/410)
 */
export class GoneError extends BaseError {
  constructor(description = "Gone") {
    super(HttpStatusCode.GONE, description, true);
  }
}
