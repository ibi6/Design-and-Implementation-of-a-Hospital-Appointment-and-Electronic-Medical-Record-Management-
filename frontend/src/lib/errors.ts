/** Converts an unknown rejection into a safe user-facing message. */
export function errorMessage(error: unknown, fallback = '数据加载失败，请稍后重试') {
  return error instanceof Error && error.message ? error.message : fallback
}
