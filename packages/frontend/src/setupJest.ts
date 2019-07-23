import "jest-preset-angular";

Object.defineProperty(window, "ClipboardEvent", {
  value: class ClipboardEvent {}
});

Object.defineProperty(window, "DragEvent", {
  value: class DragEvent {}
});
