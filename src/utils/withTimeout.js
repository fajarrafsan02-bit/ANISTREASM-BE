// utils/timeoutPromise.js
export function withTimeout(promise, ms, label) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}