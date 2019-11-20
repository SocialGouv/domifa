import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: "[digitOnly]"
})
export class DigitOnlyDirective {
  public inputElement: HTMLElement;
  private navigationKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "Home",
    "End",
    "ArrowLeft",
    "ArrowRight",
    "Clear",
    "Copy",
    "Paste"
  ];
  constructor(public el: ElementRef) {
    this.inputElement = el.nativeElement;
  }

  @HostListener("keydown", ["$event"])
  public onKeyDown(e: KeyboardEvent) {
    if (
      this.navigationKeys.indexOf(e.key) > -1 || // Allow: navigation keys: backspace, delete, arrows etc.
      (e.key === "a" && e.ctrlKey === true) || // Allow: Ctrl+A
      (e.key === "c" && e.ctrlKey === true) || // Allow: Ctrl+C
      (e.key === "v" && e.ctrlKey === true) || // Allow: Ctrl+V
      (e.key === "x" && e.ctrlKey === true) || // Allow: Ctrl+X
      (e.key === "a" && e.metaKey === true) || // Allow: Cmd+A (Mac)
      (e.key === "c" && e.metaKey === true) || // Allow: Cmd+C (Mac)
      (e.key === "v" && e.metaKey === true) || // Allow: Cmd+V (Mac)
      (e.key === "x" && e.metaKey === true)
    ) {
      // let it happen, don't do anything
      return;
    }
    if (isNaN(Number(e.key)) || e.keyCode === 32) {
      e.preventDefault();
    }
  }

  @HostListener("paste", ["$event"])
  public onPaste(event: any) {
    event.preventDefault();
    const pastedInput: string = event.clipboardData
      .getData("text/plain")
      .replace(/\D/g, ""); // get a digit-only string
    document.execCommand("insertText", false, pastedInput);
  }

  @HostListener("drop", ["$event"])
  public onDrop(event: DragEvent) {
    event.preventDefault();
    const textData = event.dataTransfer.getData("text").replace(/\D/g, "");
    this.inputElement.focus();
    document.execCommand("insertText", false, textData);
  }
}
