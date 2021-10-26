import { DayOpeningHours } from ".";
import { AppEntity } from "..";

export type StructureHoraires = AppEntity & {
  description: { default: null; type: String };
  friday: {
    open: Boolean;
    timeslot: [DayOpeningHours];
  };
  monday: {
    open: Boolean;
    timeslot: [DayOpeningHours];
  };
  saturday: {
    open: Boolean;
    timeslot: [DayOpeningHours];
  };
  sunday: {
    open: Boolean;
    timeslot: [DayOpeningHours];
  };
  thursday: {
    open: Boolean;
    timeslot: [DayOpeningHours];
  };
  tuesday: {
    open: Boolean;
    timeslot: [DayOpeningHours];
  };
  wednesday: {
    open: Boolean;
    timeslot: [DayOpeningHours];
  };
};
