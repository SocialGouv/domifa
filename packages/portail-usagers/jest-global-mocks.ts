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
