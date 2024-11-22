export const getStringFromData = (value?: Date | string | number): string => {
  return typeof value === "undefined" || value === null ? "" : value.toString();
};

export const getStringOrNull = (
  value?: Date | string | number | boolean
): any => {
  return typeof value === "undefined" || value === null ? null : value;
};
