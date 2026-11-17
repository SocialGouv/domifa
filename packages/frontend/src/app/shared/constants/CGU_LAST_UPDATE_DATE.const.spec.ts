import {
  CGU_LAST_UPDATE_DATE,
  hasAcceptedCurrentCgu,
} from "./CGU_LAST_UPDATE_DATE.const";

describe("CGU_LAST_UPDATE_DATE", () => {
  it("is anchored to 2026-11-03 at midnight UTC", () => {
    expect(CGU_LAST_UPDATE_DATE.toISOString()).toBe("2026-11-03T00:00:00.000Z");
    expect(CGU_LAST_UPDATE_DATE.getUTCFullYear()).toBe(2026);
    expect(CGU_LAST_UPDATE_DATE.getUTCMonth()).toBe(10);
    expect(CGU_LAST_UPDATE_DATE.getUTCDate()).toBe(3);
    expect(CGU_LAST_UPDATE_DATE.getUTCHours()).toBe(0);
  });
});

describe("hasAcceptedCurrentCgu", () => {
  describe("valeurs falsy", () => {
    it("retourne false si null", () => {
      expect(hasAcceptedCurrentCgu(null)).toBe(false);
    });

    it("retourne false si undefined", () => {
      expect(hasAcceptedCurrentCgu(undefined)).toBe(false);
    });

    it("retourne false si chaîne vide", () => {
      expect(hasAcceptedCurrentCgu("")).toBe(false);
    });

    it("retourne false si date invalide", () => {
      expect(hasAcceptedCurrentCgu("not-a-date")).toBe(false);
      expect(hasAcceptedCurrentCgu(new Date("invalid"))).toBe(false);
    });
  });

  describe("dates antérieures à la mise à jour CGU", () => {
    it("retourne false pour une date bien antérieure", () => {
      expect(hasAcceptedCurrentCgu(new Date("2025-01-01T00:00:00Z"))).toBe(
        false
      );
    });

    it("retourne false pour la version CGU précédente (29 juillet 2026)", () => {
      expect(hasAcceptedCurrentCgu(new Date("2026-07-29T00:00:00Z"))).toBe(
        false
      );
    });

    it("retourne false pour une milliseconde avant la bascule UTC", () => {
      expect(hasAcceptedCurrentCgu(new Date("2026-11-02T23:59:59.999Z"))).toBe(
        false
      );
    });
  });

  describe("dates de bascule exactes", () => {
    it("retourne true à la milliseconde exacte de la bascule UTC", () => {
      expect(hasAcceptedCurrentCgu(new Date("2026-11-03T00:00:00Z"))).toBe(
        true
      );
    });

    it("retourne true 1 ms après la bascule UTC", () => {
      expect(hasAcceptedCurrentCgu(new Date("2026-11-03T00:00:00.001Z"))).toBe(
        true
      );
    });
  });

  describe("dates postérieures à la mise à jour CGU", () => {
    it("retourne true pour une date en 2027", () => {
      expect(hasAcceptedCurrentCgu(new Date("2027-01-01T00:00:00Z"))).toBe(
        true
      );
    });

    it("accepte une Date native", () => {
      expect(hasAcceptedCurrentCgu(new Date("2026-11-15T12:00:00Z"))).toBe(
        true
      );
    });

    it("accepte une chaîne ISO", () => {
      expect(hasAcceptedCurrentCgu("2026-11-15T12:00:00Z")).toBe(true);
    });
  });

  describe("indépendance au fuseau horaire", () => {
    // La bascule est ancrée à 2026-11-03T00:00:00Z : c'est le même instant
    // absolu pour tous les navigateurs, quel que soit le fuseau local.

    it("retourne true pour une acceptation le 3 novembre 01:00 heure de Paris (hiver, UTC+1)", () => {
      // 01:00 Paris = 00:00 UTC → pile sur la bascule
      expect(hasAcceptedCurrentCgu("2026-11-03T01:00:00+01:00")).toBe(true);
    });

    it("retourne false pour une acceptation le 3 novembre 00:30 heure de Paris (hiver, UTC+1)", () => {
      // 00:30 Paris = 2026-11-02T23:30:00Z → avant la bascule
      expect(hasAcceptedCurrentCgu("2026-11-03T00:30:00+01:00")).toBe(false);
    });

    it("retourne true pour le 3 novembre 13:00 à Auckland (UTC+13)", () => {
      // 13:00 NZDT = 2026-11-03T00:00:00Z (à l'heure d'été, +13)
      expect(hasAcceptedCurrentCgu("2026-11-03T13:00:00+13:00")).toBe(true);
    });

    it("retourne false pour le 3 novembre 09:00 à Auckland (UTC+13)", () => {
      // 09:00 NZDT = 2026-11-02T20:00:00Z → avant la bascule
      expect(hasAcceptedCurrentCgu("2026-11-03T09:00:00+13:00")).toBe(false);
    });

    it("retourne true pour le 2 novembre 20:00 à Honolulu (UTC-10)", () => {
      // 20:00 HST = 2026-11-03T06:00:00Z → après la bascule
      expect(hasAcceptedCurrentCgu("2026-11-02T20:00:00-10:00")).toBe(true);
    });

    it("retourne false pour le 2 novembre 13:00 à Honolulu (UTC-10)", () => {
      // 13:00 HST = 2026-11-02T23:00:00Z → avant la bascule
      expect(hasAcceptedCurrentCgu("2026-11-02T13:00:00-10:00")).toBe(false);
    });

    it("produit le même résultat pour un même instant écrit dans deux fuseaux", () => {
      // Même instant absolu, deux notations
      const parisNoon = "2026-11-15T13:00:00+01:00";
      const utcNoon = "2026-11-15T12:00:00Z";
      expect(hasAcceptedCurrentCgu(parisNoon)).toBe(
        hasAcceptedCurrentCgu(utcNoon)
      );
      expect(hasAcceptedCurrentCgu(parisNoon)).toBe(true);
    });
  });
});
