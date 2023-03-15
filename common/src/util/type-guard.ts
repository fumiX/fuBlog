export const isNotNull: <T>(x: T) => x is NonNullable<T> = <T>(x: T): x is NonNullable<T> => !!x;
