export const xlFormater = {
  toLocalTimezone,
};

function toLocalTimezone(date: Date) {
  if (!date) {
    return date;
  }
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  );
}
