import { AsyncLocalStorage } from "node:async_hooks";

type CfExecutionContext = { waitUntil: (promise: Promise<unknown>) => void };

export const cfContextStorage = new AsyncLocalStorage<CfExecutionContext>();

export function cfWaitUntil(promise: Promise<unknown>) {
  const ctx = cfContextStorage.getStore();
  if (ctx) {
    ctx.waitUntil(promise);
  }
}
