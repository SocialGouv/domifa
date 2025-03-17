import { Usager } from "@domifa/common";
import {
  STRUCTURE_MOCK,
  USAGER_REFUS_MOCK,
  USAGER_VALIDE_MOCK,
  VERIFIED_USERS_STRUCTURE,
} from "../../../../_common/mocks";
import { renderStructureUsagersRows } from "../renderStructureUsagersRows";
import { FIRST_SHEET_USAGERS } from "./FIRST_SHEET_USAGERS.mock";

describe("renderStructureUsagersRows", () => {
  const usagers: Usager[] = [
    { ...USAGER_VALIDE_MOCK },
    { ...USAGER_REFUS_MOCK },
  ];

  it("Generate sheets", async () => {
    const chips = renderStructureUsagersRows(
      usagers,
      STRUCTURE_MOCK,
      VERIFIED_USERS_STRUCTURE
    );
    expect(chips.firstSheetUsagers.length).toEqual(2);
    expect(chips.firstSheetUsagers[0]).toEqual(FIRST_SHEET_USAGERS[0]);
    expect(chips.firstSheetUsagers[1]).toEqual(FIRST_SHEET_USAGERS[1]);
  });
});
