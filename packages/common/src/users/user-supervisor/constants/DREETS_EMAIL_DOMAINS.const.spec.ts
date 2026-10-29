import { REGIONS_DEF } from "../../../territoires";
import { DREETS_EMAIL_DOMAINS } from "./DREETS_EMAIL_DOMAINS.const";

describe("DREETS_EMAIL_DOMAINS", () => {
  const regionCodes = REGIONS_DEF.map((region) => region.regionCode);

  it("only references known regions", () => {
    for (const code of Object.keys(DREETS_EMAIL_DOMAINS)) {
      expect(regionCodes).toContain(code);
    }
  });

  it("only contains single-label .gouv.fr domains", () => {
    for (const domains of Object.values(DREETS_EMAIL_DOMAINS)) {
      expect(domains.length).toBeGreaterThan(0);
      for (const domain of domains) {
        expect(domain).toMatch(/^[a-z0-9-]+\.gouv\.fr$/);
      }
    }
  });

  it("excludes regions without a known regional service", () => {
    for (const code of ["NC", "PO", "SB", "SM", "SP", "WF"]) {
      expect(DREETS_EMAIL_DOMAINS[code]).toBeUndefined();
    }
  });
});
