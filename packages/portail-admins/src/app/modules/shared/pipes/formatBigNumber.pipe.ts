import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "formatBigNumber" })
export class FormatBigNumberPipe implements PipeTransform {
  transform(nb: number): string {
    return nb.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
}
