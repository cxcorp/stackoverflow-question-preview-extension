export const isNotNil = <T>(n: T | undefined | null): n is T =>
  typeof n !== "undefined" && n !== null;
