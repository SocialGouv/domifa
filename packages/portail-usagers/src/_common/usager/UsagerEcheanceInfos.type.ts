export type UsagerEcheanceInfos = {
  isActif: boolean;
  dateToDisplay: Date | null;
  dayBeforeEnd: number;
  color: "d-none" | "bg-danger" | "bg-warning";
};
