export const generateScheduleSendDate = (dateReference: Date): Date => {
  const dayOfNow = dateReference.getDay();

  const TUESDAY = 2;
  const THURSDAY = 4;

  if (
    dayOfNow === 3 ||
    (dayOfNow === 2 && dateReference.getHours() > 19) ||
    (dayOfNow === 4 && dateReference.getHours() < 19)
  ) {
    return getNextDay(dateReference, THURSDAY);
  }

  return getNextDay(dateReference, TUESDAY);
};

export const getNextDay = (dateReference: Date, dayToSearch: 2 | 4): Date => {
  dateReference.setDate(
    dateReference.getDate() + ((dayToSearch + (7 - dateReference.getDay())) % 7)
  );
  dateReference.setUTCHours(19, 0, 0);

  return dateReference;
};
