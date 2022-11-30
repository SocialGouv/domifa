import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "formatBigNumber" })
export class FormatBigNumberPipe implements PipeTransform {
  public transform(nb: number): string {
    return nb ? nb.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "0";
  }
}
