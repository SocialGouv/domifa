import { TranslationWidth } from "@angular/common";
import { Injectable } from "@angular/core";
import { NgbDatepickerI18n, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

const I18N_VALUES = {
  fr: {
    months: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Sept.",
      "Oct.",
      "Nov.",
      "Déc.",
    ],
    weekdays: ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"],
  },
};

@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
  public getWeekdayLabel(weekday: number, width?: TranslationWidth): string {
    return I18N_VALUES.fr.weekdays[weekday - 1];
  }
  public getMonthShortName(month: number): string {
    return I18N_VALUES.fr.months[month - 1];
  }
  public getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }
  public getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}
