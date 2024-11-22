export const formatBoolean = (element: boolean): string => {
  return element ? "OUI" : "NON";
};

export const ucFirst = (value: string) => {
  return !value || value === ""
    ? ""
    : value.charAt(0).toUpperCase() + value.slice(1);
};
