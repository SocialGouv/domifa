import { Pipe, PipeTransform } from "@angular/core";
@Pipe({ name: "nl2br", standalone: true })
export class ReplaceLineBreaks implements PipeTransform {
  public transform(value: string): string {
    return value.replace(/\n/g, "<br/>");
  }
}
