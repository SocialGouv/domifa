import { StructureCustomDocTags } from "../../../_common/model";
import { isValid, parse } from "date-fns";
export const applyDateFormat = (
  worksheet: StructureCustomDocTags[],
  elements: Array<keyof StructureCustomDocTags>
): void => {
  worksheet.forEach((ws: StructureCustomDocTags) => {
    elements.forEach((element: keyof StructureCustomDocTags) => {
      if (ws[element]) {
        const value = ws[element] as string;
        ws[element] = isValid(parse(value, "dd/MM/yyyy", new Date()))
          ? parse(value, "dd/MM/yyyy", new Date())
          : value;
      }
    });
  });
};
