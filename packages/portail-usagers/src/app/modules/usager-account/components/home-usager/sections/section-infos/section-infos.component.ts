import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

import {
  USAGER_DECISION_STATUT_LABELS,
  getRdvInfo,
  getDecisionDeadline,
  PortailUsagerPublic,
} from "@domifa/common";

@Component({
  selector: "app-section-infos",
  templateUrl: "./section-infos.component.html",
  styleUrl: "./section-infos.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionInfosComponent {
  public readonly USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  public readonly usager = input.required<PortailUsagerPublic>();

  public readonly decisionDeadline = computed(() =>
    getDecisionDeadline(this.usager()),
  );
  public readonly rdvInfo = computed(() => getRdvInfo(this.usager()));

  public readonly showRendezVousReminder = computed(
    () =>
      this.usager().decision.statut === "INSTRUCTION" &&
      Boolean(this.rdvInfo()?.content),
  );

  public readonly showWaitingForDecision = computed(
    () =>
      this.usager().decision.statut === "ATTENTE_DECISION" &&
      this.usager().typeDom === "RENOUVELLEMENT",
  );

  public readonly showApproachingExpiry = computed(() => {
    const deadline = this.decisionDeadline();
    return (
      this.usager().decision.statut !== "ATTENTE_DECISION" &&
      deadline.daysBeforeEnd > 0 &&
      deadline.daysBeforeEnd < 60
    );
  });

  public readonly showExpirationMessage = computed(
    () =>
      this.usager().decision.statut !== "ATTENTE_DECISION" &&
      this.decisionDeadline().daysBeforeEnd < 0,
  );
}
