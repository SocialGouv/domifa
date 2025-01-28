import { format, isValid, parse } from "date-fns";

export const parseBirthDate = (text: string): string | null => {
  const parsedDate = parse(text.trim(), "dd/MM/yyyy", new Date());
  if (!isValid(parsedDate)) {
    return null;
  }
  const minDate = new Date(1900, 0, 1);
  const today = new Date();

  if (parsedDate < minDate || parsedDate > today) {
    return null;
  }
  return format(parsedDate, "ddMMyyyy");
};
