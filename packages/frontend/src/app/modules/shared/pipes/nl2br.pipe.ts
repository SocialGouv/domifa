import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
  name: "nl2br",
  standalone: false,
})
export class ReplaceLineBreaks implements PipeTransform {
  public transform(value: string): string {
    return value.replace(/\n/g, "<br/>");
  }
}
