import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

export class UnauthorizedError extends BaseError {
  constructor(description = "Unauthorized") {
    super(HttpStatusCode.UNAUTHORIZED, description, true);
  }
}
