import { Usager } from "@domifa/common";
import {
  STRUCTURE_MOCK,
  USAGER_REFUS_MOCK,
  USAGER_VALIDE_MOCK,
} from "../../../../_common/mocks";
import { renderStructureUsagersRows } from "../renderStructureUsagersRows";
import { FIRST_SHEET_USAGERS } from "./FIRST_SHEET_USAGERS.mock";

describe("renderStructureUsagersRows", () => {
  const usagers: Usager[] = [
    { ...USAGER_VALIDE_MOCK },
    { ...USAGER_REFUS_MOCK },
  ];

  it("Generate sheets", async () => {
    const chips = renderStructureUsagersRows(usagers, STRUCTURE_MOCK);
    expect(chips.firstSheetUsagers.length).toEqual(4);
    expect(chips.firstSheetUsagers[1]).toEqual(FIRST_SHEET_USAGERS[0]);
    expect(chips.firstSheetUsagers[2]).toEqual(FIRST_SHEET_USAGERS[1]);
    expect(chips.firstSheetUsagers[3]).toEqual(FIRST_SHEET_USAGERS[2]);
  });
});
