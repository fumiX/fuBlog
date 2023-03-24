export const isNeitherNullNorUndefined: <T>(x: T) => x is NonNullable<T> = <T>(x: T): x is NonNullable<T> => !!x;

/**
 * Insert this at any point in the code, which should be intentionally unreachable.
 * A good example would be immediately after an exhaustive switch statement. Pass in the variable, on which you do the switch.
 * This will produce an error, if there is still any path on which the function call can be reached.
 */
export function assertUnreachable(x: never): never {
  throw new Error("This can never be reached!");
}
