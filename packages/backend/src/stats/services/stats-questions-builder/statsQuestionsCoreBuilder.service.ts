import moment = require("moment");
import { Between } from "typeorm";
import { interactionRepository } from "../../../database";
import { InteractionType } from "../../../_common/model";

export const statsQuestionsCoreBuilder = {
  expectDateToHaveNoUtcHoursMinutes,
  setFixStatsDateTime,
  buildStatsDateUTC,
  removeUTCHours,
  countInteractions,
};

async function countInteractions({
  dateInteractionBefore,
  dateInteractionAfter,
  structureId,
  interactionType,
}: {
  dateInteractionBefore: Date;
  dateInteractionAfter: Date;
  structureId: number;
  interactionType: InteractionType;
}): Promise<number> {
  if (interactionType === "appel" || interactionType === "visite") {
    //
    return interactionRepository.count({
      where: {
        structureId,
        type: interactionType,
        dateInteraction: (Between(
          dateInteractionAfter,
          dateInteractionBefore
        ) as unknown) as Date,
      },
    });
  } else {
    return await interactionRepository.sum({
      sumAttribute: "nbCourrier",
      where: {
        structureId,
        type: interactionType,
        dateInteraction: (Between(
          dateInteractionAfter,
          dateInteractionBefore
        ) as unknown) as Date,
      },
    });
  }
}
function expectDateToHaveNoUtcHoursMinutes(statsDateUTC: Date) {
  if (
    statsDateUTC.getUTCHours() !== 0 ||
    statsDateUTC.getUTCMinutes() !== 0 ||
    statsDateUTC.getUTCSeconds() !== 0 ||
    statsDateUTC.getUTCMilliseconds() !== 0
  ) {
    throw new Error(
      `Invalid statsDateUTC hours/minutes/seconds/ms as UTC should be 0 (statsDateUTC=${statsDateUTC.toISOString()})'`
    );
  }
}

function setFixStatsDateTime(statsDateUTC: Date) {
  // 11:11 par défaut pour faciliter les requêtes
  return moment(statsDateUTC)
    .set("hour", 11)
    .set("minute", 11)
    .endOf("hour")
    .toDate();
}

function buildStatsDateUTC({ date }: { date: "yesterday" | string }) {
  if (date === "yesterday") {
    // 'yesterday' utc date
    return removeUTCHours(moment.utc().subtract(1, "day").toDate());
  } else if (date) {
    // parse date
    return removeUTCHours(moment.utc(date).toDate());
  }
}

function removeUTCHours(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}
