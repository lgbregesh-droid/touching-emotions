// Vercel adapter — cfWaitUntil runs the promise directly (no Cloudflare execution context needed)
export function cfWaitUntil(promise: Promise<unknown>) {
  promise.catch((err) => {
    console.error("cfWaitUntil error:", err);
  });
}
