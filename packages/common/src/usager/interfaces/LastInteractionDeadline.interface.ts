export interface LastInteractionDeadline {
  isActive: boolean;
  dateToDisplay: Date | null;
  color: "bg-danger" | "bg-warning" | null;
}
