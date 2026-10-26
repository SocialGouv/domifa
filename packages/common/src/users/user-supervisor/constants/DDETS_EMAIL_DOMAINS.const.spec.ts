import {
  DEPARTEMENTS_LISTE,
  getRegionCodeFromDepartement,
} from "../../../territoires";
import { getRegionDepartmentCodes } from "../functions";
import {
  DDETS_EMAIL_DOMAINS,
  DDETS_SHARED_EMAIL_DOMAINS,
} from "./DDETS_EMAIL_DOMAINS.const";

describe("DDETS_EMAIL_DOMAINS", () => {
  const entries = Object.entries(DDETS_EMAIL_DOMAINS);

  it("only references known departments", () => {
    for (const [code] of entries) {
      expect(DEPARTEMENTS_LISTE[code]).toBeDefined();
    }
  });

  it("only contains single-label .gouv.fr domains", () => {
    for (const [, domains] of entries) {
      expect(domains.length).toBeGreaterThan(0);
      for (const domain of domains) {
        expect(domain).toMatch(/^[a-z0-9-]+\.gouv\.fr$/);
      }
    }
  });

  it("never shares a domain between two departments, except allowed ones", () => {
    const domains = entries
      .flatMap(([, list]) => list)
      .filter((domain) => !DDETS_SHARED_EMAIL_DOMAINS.includes(domain));
    expect(new Set(domains).size).toEqual(domains.length);
  });

  it("only shares domains between single-department regions", () => {
    for (const [code, domains] of entries) {
      if (domains.some((d) => DDETS_SHARED_EMAIL_DOMAINS.includes(d))) {
        expect(
          getRegionDepartmentCodes([getRegionCodeFromDepartement(code)])
        ).toEqual([code]);
      }
    }
  });

  it("covers the overseas departments with a known service", () => {
    for (const code of ["971", "972", "973", "974", "975", "976"]) {
      expect(DDETS_EMAIL_DOMAINS[code]).toBeDefined();
    }
  });

  it("excludes departments without a departmental domain", () => {
    for (const code of ["75", "92", "93", "94", "977", "978", "988"]) {
      expect(DDETS_EMAIL_DOMAINS[code]).toBeUndefined();
    }
  });
});
