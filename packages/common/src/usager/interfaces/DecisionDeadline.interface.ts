export interface DecisionDeadline {
  isActive: boolean;
  dateToDisplay: Date | null;
  daysBeforeEnd: number;
  color: "d-none" | "bg-danger" | "bg-warning";
}
