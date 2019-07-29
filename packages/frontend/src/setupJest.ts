import "jest-preset-angular";

Object.defineProperty(window, "ClipboardEvent", {
  value: class ClipboardEvent {}
});

Object.defineProperty(window, "DragEvent", {
  // tslint:disable-next-line: max-classes-per-file
  value: class DragEvent {}
});
