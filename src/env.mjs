/**
 * Simple environment variable getter
 */
export function getEnv(key) {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}
