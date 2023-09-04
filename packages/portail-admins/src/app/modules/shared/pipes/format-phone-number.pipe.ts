import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "formatPhoneNumber" })
export class FormatPhoneNumberPipe implements PipeTransform {
  public transform(phoneNumber: string): string {
    if (!phoneNumber) return "";

    phoneNumber = phoneNumber.replace(/^\+33/, "0").replace(/\./g, "").trim();

    const chunks = [];
    while (phoneNumber.length > 0) {
      chunks.unshift(phoneNumber.slice(-2));
      phoneNumber = phoneNumber.slice(0, -2);
    }

    return chunks.join(" ");
  }
}
