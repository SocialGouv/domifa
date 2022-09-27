export const statsQuestionsCoreBuilder = {
  expectDateToHaveNoUtcHoursMinutes,
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

function removeUTCHours(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}
