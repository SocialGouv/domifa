import { DayOpeningHours } from ".";
import { AppEntity } from "..";

export type StructureHoraires = AppEntity & {
  description: { default: null; type: String };
  friday: {
    open: Boolean;
    openingHours: [DayOpeningHours];
  };
  monday: {
    open: Boolean;
    openingHours: [DayOpeningHours];
  };
  saturday: {
    open: Boolean;
    openingHours: [DayOpeningHours];
  };
  sunday: {
    open: Boolean;
    openingHours: [DayOpeningHours];
  };
  thursday: {
    open: Boolean;
    openingHours: [DayOpeningHours];
  };
  tuesday: {
    open: Boolean;
    openingHours: [DayOpeningHours];
  };
  wednesday: {
    open: Boolean;
    openingHours: [DayOpeningHours];
  };
};
