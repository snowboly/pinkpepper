/**
 * Creates an AbortSignal that times out after the given milliseconds.
 * Use with Supabase queries: `.abortSignal(queryTimeout())`
 *
 * Default: 10 seconds.
 */
export function queryTimeout(ms = 10_000): AbortSignal {
  return AbortSignal.timeout(ms);
}
