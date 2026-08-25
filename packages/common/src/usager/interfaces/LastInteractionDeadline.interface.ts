export interface LastInteractionDeadline {
  isActive: boolean;
  dateToDisplay: Date | null;
  daysSinceLastPassage: number;
  color: "bg-danger" | "bg-warning" | null;
}
