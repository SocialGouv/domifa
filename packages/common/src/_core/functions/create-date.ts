export const createDate = (date?: Date | string | null): Date | null => {
  return date ? new Date(date) : null;
};
