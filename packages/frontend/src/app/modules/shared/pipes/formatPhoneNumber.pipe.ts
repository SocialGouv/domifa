import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "formatPhoneNumber" })
export class FormatPhoneNumberPipe implements PipeTransform {
  transform(phoneNumber: string): string {
    return phoneNumber.toString().replace(/\B(?=(\d{2})+(?!\d))/g, " ");
  }
}
