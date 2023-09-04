import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "formatBigNumber" })
export class FormatBigNumberPipe implements PipeTransform {
  public transform(nb: number): string {
    let strNb = nb.toString();
    const chunks = [];

    while (strNb.length > 0) {
      chunks.unshift(strNb.slice(-3));
      strNb = strNb.slice(0, -3);
    }

    return chunks.join(" ");
  }
}
