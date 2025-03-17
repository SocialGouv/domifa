import { StructureCustomDocTags } from "../../../_common/model";
import { parse } from "date-fns";

export const applyDateFormat = (
  worksheet: StructureCustomDocTags[],
  elements: Array<keyof StructureCustomDocTags>
): void => {
  const baseDate = new Date();
  const dateFormat = "dd/MM/yyyy";

  for (let i = 0; i < worksheet.length; i++) {
    const ws = worksheet[i];

    for (let j = 0; j < elements.length; j++) {
      const element = elements[j];
      const value = ws[element];

      if (!value) continue;

      try {
        const parsedDate = parse(value as string, dateFormat, baseDate);
        ws[element] =
          parsedDate.toString() !== "Invalid Date" ? parsedDate : value;
      } catch {
        continue;
      }
    }
  }
};
