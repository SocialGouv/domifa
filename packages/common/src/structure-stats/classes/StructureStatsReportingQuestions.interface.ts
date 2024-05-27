import { type UserStructureCreatedBy } from "../../user-structure";
import { type StructureWaitingTime } from "../enums";

export class StructureStatsReportingQuestions {
  public waitingList: boolean | null; // Existe-t-il une liste d’attente pour le traitement des demandes de domiciliation dans votre structure ?
  public waitingTime: StructureWaitingTime | null; // quel est le délai moyen d’attente sur l’année ?
  public workers: number | null; // Nombre d'ETP salariés dédiés à l'activité de domiciliation
  public volunteers: number | null; // Nombre de bénévoles dédiés à l'activité de domiciliation
  public humanCosts: number | null; // Coût total des moyens humains
  public totalCosts: number | null; // Coût total de l'activité de domiciliation
  public year: number;
  public structureId: number;
  public completedBy: UserStructureCreatedBy | null;
  public confirmationDate: Date | null;

  constructor(stats?: StructureStatsReportingQuestions) {
    this.waitingList = stats?.waitingList ?? null;
    this.waitingTime = stats?.waitingTime ?? null;
    this.workers = stats?.workers ?? null;
    this.volunteers = stats?.volunteers ?? null;
    this.humanCosts = stats?.humanCosts ?? null;
    this.totalCosts = stats?.totalCosts ?? null;
    this.year = stats?.year ?? new Date().getFullYear();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.structureId = stats!.structureId;
    this.completedBy = stats?.completedBy ?? null;
    this.confirmationDate = stats?.confirmationDate ?? null;
  }
}
