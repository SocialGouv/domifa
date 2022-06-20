import { apm } from "../start";

export function instrumentFunction(
  fn: any,
  name: string,
  logArguments = false
) {
  async function wrapper(this: any) {
    const span = apm.startSpan(name);

    if (span && logArguments) {
      for (let arg = 0; arg < arguments.length; arg++) {
        // eslint-disable-next-line prefer-rest-params
        span.setLabel(`arg${arg}`, arguments[arg]);
      }
    }
    // eslint-disable-next-line prefer-rest-params
    const result = await fn.apply(this, arguments);
    if (span) {
      span.end();
    }
    return result;
  }
  return wrapper;
}

export function startApmSpan(name: string | null, context?: any) {
  const span = apm.startSpan(name);
  if (span) {
    for (const key in context) {
      span.setLabel(key, context[key]);
    }
  }
  return span;
}

export function instrumentWithAPM(target, name, descriptor) {
  const original = descriptor.value;
  if (typeof original === "function") {
    const fullName = `${target.constructor.name}.${name}`;
    descriptor.value = instrumentFunction(original, fullName);
  }
  return descriptor;
}
