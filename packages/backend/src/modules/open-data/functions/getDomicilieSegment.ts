import { DomiciliesSegmentEnum } from "@domifa/common";

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
