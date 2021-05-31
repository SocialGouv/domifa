import moment = require("moment");

export const statsQuestionsCoreBuilder = {
  expectDateToHaveNoUtcHoursMinutes,
  setFixStatsDateTime,
  removeUTCHours,
};

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

function removeUTCHours(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}
