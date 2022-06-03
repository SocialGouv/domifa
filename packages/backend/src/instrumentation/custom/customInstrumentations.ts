import { apm } from "../start";


export function instrumentFunction(fn, name, logArguments=false) {
    async function wrapper() {
        const span = apm.startSpan(name);

        if (span && logArguments) {
            for(let arg=0; arg < arguments.length; arg++) {
                span.setLabel(`arg${arg}`, arguments[arg])
            }
        }

        // @ts-ignore
        const result = await fn.apply(this, arguments);
        if (span) {
            span.end();
        }
        return result;
    }
    return wrapper;
}

export function startApmSpan(name, context?) {
    const span = apm.startSpan(name);
    if (span) {
        for (let key in context) {
            span.setLabel(key, context[key]);
        };
    }
    return span;
}


export function instrumentWithAPM(target, name, descriptor) {
    const original = descriptor.value;
    if (typeof original === 'function') {
        const fullName = `${target.constructor.name}.${name}`;
        descriptor.value = instrumentFunction(original, fullName);
    }
    return descriptor;
}