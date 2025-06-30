import { DomiciliesSegmentEnum, PopulationSegmentEnum } from "@domifa/common";

export function getDomiciliesSegment(
  nbDomicilies: number
): DomiciliesSegmentEnum {
  if (nbDomicilies < 10) {
    return DomiciliesSegmentEnum.VERY_SMALL;
  } else if (nbDomicilies >= 10 && nbDomicilies <= 499) {
    return DomiciliesSegmentEnum.SMALL;
  } else if (nbDomicilies >= 500 && nbDomicilies <= 1999) {
    return DomiciliesSegmentEnum.MEDIUM;
  }
  return DomiciliesSegmentEnum.LARGE;
}

export const getPopulationSegment = (
  population: number
): PopulationSegmentEnum => {
  if (population < 10000) {
    return PopulationSegmentEnum.SMALL;
  } else if (population >= 10000 && population <= 49999) {
    return PopulationSegmentEnum.MEDIUM;
  } else if (population >= 50000 && population <= 99999) {
    return PopulationSegmentEnum.LARGE;
  } else if (population >= 100000) {
    return PopulationSegmentEnum.VERY_LARGE;
  }
  throw new Error("Population value is invalid");
};
