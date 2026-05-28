import { NgClass } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from "@angular/core";
import { DsfrTooltipDirective } from "@edugouvfr/ngx-dsfr";
import { differenceInYears, format } from "date-fns";
import { fr } from "date-fns/locale";

@Component({
  selector: "app-display-password-age",
  imports: [NgClass, DsfrTooltipDirective],
  templateUrl: "./display-password-age.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayPasswordAgeComponent implements OnChanges {
  @Input() public passwordLastUpdate: Date | string | null = null;
  // Account creation date — used as the fallback reference when
  // `passwordLastUpdate` is empty: at sign-up the user always picks their
  // own password, so the createdAt date IS the password's birth date.
  @Input() public createdAt: Date | string | null = null;

  public badgeClass = "";
  public label = "";
  public tooltip = "";

  public ngOnChanges(): void {
    const reference = this.passwordLastUpdate ?? this.createdAt;
    if (!reference) {
      this.badgeClass = "fr-badge--error";
      this.label = "Inconnu";
      this.tooltip = "";
      return;
    }

    const refDate = new Date(reference);
    const years = differenceInYears(new Date(), refDate);

    if (years >= 2) {
      this.badgeClass = "fr-badge--error";
    } else if (years >= 1) {
      this.badgeClass = "fr-badge--warning";
    } else {
      this.badgeClass = "fr-badge--success";
    }

    this.label = format(refDate, "d MMMM y", { locale: fr });
    const fullDate = format(refDate, "d MMMM y 'à' HH:mm", { locale: fr });
    this.tooltip = this.passwordLastUpdate
      ? `Mot de passe mis à jour le ${fullDate}`
      : `Mot de passe défini à l'inscription le ${fullDate}`;
  }
}
