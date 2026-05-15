import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "ucFirst",
  standalone: false,
})
export class UcFirstPipe implements PipeTransform {
  public transform(value: string): string {
    return value
      ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      : "";
  }
}
