import { DayOpeningHours } from ".";
import { AppEntity } from "..";

export type StructureHoraires = AppEntity & {
  description: { default: null; type: string };
  friday: {
    open: boolean;
    openingHours: [DayOpeningHours];
  };
  monday: {
    open: boolean;
    openingHours: [DayOpeningHours];
  };
  saturday: {
    open: boolean;
    openingHours: [DayOpeningHours];
  };
  sunday: {
    open: boolean;
    openingHours: [DayOpeningHours];
  };
  thursday: {
    open: boolean;
    openingHours: [DayOpeningHours];
  };
  tuesday: {
    open: boolean;
    openingHours: [DayOpeningHours];
  };
  wednesday: {
    open: boolean;
    openingHours: [DayOpeningHours];
  };
};
