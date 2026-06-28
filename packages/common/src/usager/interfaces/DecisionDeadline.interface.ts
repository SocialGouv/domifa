export interface DecisionDeadline {
  isActive: boolean;
  dateToDisplay: Date | null;
  daysBeforeEnd: number;
  color: "bg-danger" | "bg-warning" | null;
}
