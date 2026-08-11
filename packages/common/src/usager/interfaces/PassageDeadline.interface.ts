export interface PassageDeadline {
  isActive: boolean;
  dateToDisplay: Date | null;
  daysSinceLastPassage: number;
  color: "bg-danger" | "bg-warning" | null;
}
