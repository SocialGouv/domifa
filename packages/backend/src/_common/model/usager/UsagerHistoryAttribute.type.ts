import { AppUserResume } from "../../../_common/model";

export type UsagerHistoryAttribute<T> = {
  meta: {
    createdAt: Date; // = dateDecision
    createdBy: AppUserResume;
    dateDebut: Date;
    dateFin?: Date;
  };
  value: T;
};
