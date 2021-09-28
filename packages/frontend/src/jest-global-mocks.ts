Object.defineProperty(window, "CSS", { value: null });
Object.defineProperty(document, "doctype", {
  value: "<!DOCTYPE html>",
});
Object.defineProperty(window, "getComputedStyle", {
  value: () => {
    return {
      display: "none",
      appearance: ["-webkit-appearance"],
    };
  },
});
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, "transform", {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

Object.defineProperty(window, "ClipboardEvent", {
  value: class ClipboardEvent {},
});

Object.defineProperty(window, "DragEvent", {
  // eslint-disable-next-line max-classes-per-file
  value: class DragEvent {},
});

// eslint-disable-next-line no-empty, no-empty-function, @typescript-eslint/no-empty-function
const noop = () => {};
Object.defineProperty(window, "scrollTo", { value: noop, writable: true });

const spyScrollTo = jest.fn();
Object.defineProperty(window, "scrollTo", { value: spyScrollTo });
