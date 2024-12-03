/* eslint-disable max-classes-per-file */
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: class IntersectionObserver {
    constructor(_callback: IntersectionObserverCallback) {}
    disconnect() {}
    observe() {}
    unobserve() {}
  },
});

/* eslint-disable max-classes-per-file */
Object.defineProperty(window, "CSS", { value: null });

Object.defineProperty(document, "doctype", {
  value: "<!DOCTYPE html>",
});

Object.defineProperty(window, "getComputedStyle", {
  value: () => {
    return {
      appearance: ["-webkit-appearance"],
      display: "none",
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
      configurable: true,
      enumerable: true,
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
const spyScrollTo = jest.fn();
Object.defineProperty(window, "scrollTo", { value: spyScrollTo });

const spyScroll = jest.fn();
Object.defineProperty(window, "scroll", { value: spyScroll });
