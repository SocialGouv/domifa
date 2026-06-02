import { getUserStructureEmailStatus } from "./getUserStructureEmailStatus";

// Cases inspired from real production data, anonymised. Each test exercises
// one branch of the classifier so a regression is easy to locate.
describe("getUserStructureEmailStatus", () => {
  describe("GENERIC_CONFIRMED — exact prefix match", () => {
    it('matches "contact"', () => {
      expect(getUserStructureEmailStatus("contact@asso-bouvier.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "info"', () => {
      expect(getUserStructureEmailStatus("info@cidff-rocher.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "support"', () => {
      expect(getUserStructureEmailStatus("support@cias-blanche.org")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "noreply"', () => {
      expect(getUserStructureEmailStatus("noreply@asso-rolland.com")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "no-reply"', () => {
      expect(getUserStructureEmailStatus("no-reply@cidff-roy.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "accueil"', () => {
      expect(getUserStructureEmailStatus("accueil@mairie-leveque.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "secretariat"', () => {
      expect(
        getUserStructureEmailStatus("secretariat@cias-fontaine.fr")
      ).toEqual("GENERIC_CONFIRMED");
    });

    it('matches "direction"', () => {
      expect(getUserStructureEmailStatus("direction@asso-perrin.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "mairie"', () => {
      expect(getUserStructureEmailStatus("mairie@village-rocher.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "ccas"', () => {
      expect(getUserStructureEmailStatus("ccas@ville-grangier.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "mdph"', () => {
      expect(getUserStructureEmailStatus("mdph@asso-marchand.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it('matches "coordination"', () => {
      expect(
        getUserStructureEmailStatus("coordination@arcat-fontaine.org")
      ).toEqual("GENERIC_CONFIRMED");
    });

    it('matches "domiciliation"', () => {
      expect(
        getUserStructureEmailStatus("domiciliation@asso-leblanc.fr")
      ).toEqual("GENERIC_CONFIRMED");
    });

    it('matches "accompagnement"', () => {
      expect(
        getUserStructureEmailStatus("accompagnement@sos-accueil.fr")
      ).toEqual("GENERIC_CONFIRMED");
    });
  });

  describe("GENERIC_CONFIRMED — prefix followed by separator", () => {
    it("matches prefix.suffix (accueil.ccas)", () => {
      expect(
        getUserStructureEmailStatus("accueil.ccas@mairie-leveque.fr")
      ).toEqual("GENERIC_CONFIRMED");
    });

    it("matches prefix-suffix (accueil-ccas)", () => {
      expect(
        getUserStructureEmailStatus("accueil-ccas@mairie-aubin.fr")
      ).toEqual("GENERIC_CONFIRMED");
    });

    it("matches prefix_suffix (accueil_test)", () => {
      expect(
        getUserStructureEmailStatus("accueil_test@asso-rousseau.fr")
      ).toEqual("GENERIC_CONFIRMED");
    });

    it("matches multi-segment generic (accueil.action.sociale)", () => {
      expect(
        getUserStructureEmailStatus(
          "accueil.action.sociale@ville-saint-canard.fr"
        )
      ).toEqual("GENERIC_CONFIRMED");
    });

    it("matches accompagnement.suffix", () => {
      expect(
        getUserStructureEmailStatus("accompagnement.ccas@village-malet.bzh")
      ).toEqual("GENERIC_CONFIRMED");
    });
  });

  describe("GENERIC_CONFIRMED — prefix glued with digits or compound", () => {
    it("matches prefix+digits (mairie75)", () => {
      expect(getUserStructureEmailStatus("mairie75@village-rocher.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it("matches prefix+digits (accueil2)", () => {
      expect(getUserStructureEmailStatus("accueil2@chrs-laporte.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it("matches prefix+digits (ccas38)", () => {
      expect(getUserStructureEmailStatus("ccas38@ville-aubin.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it("matches compound prefix+jour (accueildejour)", () => {
      expect(
        getUserStructureEmailStatus("accueildejour@emmaus-fabre.fr")
      ).toEqual("GENERIC_CONFIRMED");
    });

    it("matches compound prefix+social (servicesocial)", () => {
      expect(
        getUserStructureEmailStatus("servicesocial@asso-fontaine.fr")
      ).toEqual("GENERIC_CONFIRMED");
    });

    it("matches compound prefix+centre (accueilcentresocial)", () => {
      expect(
        getUserStructureEmailStatus("accueilcentresocial@village-rocher.com")
      ).toEqual("GENERIC_CONFIRMED");
    });
  });

  describe("PERSONAL — name-like patterns", () => {
    it("matches firstname.lastname", () => {
      expect(getUserStructureEmailStatus("jean.dupont@asso-fabre.fr")).toEqual(
        "PERSONAL"
      );
    });

    it("matches initial.lastname (a.martin)", () => {
      expect(getUserStructureEmailStatus("a.bonnal@village-rocher.fr")).toEqual(
        "PERSONAL"
      );
    });

    it("matches firstname-lastname with hyphen", () => {
      expect(
        getUserStructureEmailStatus("jean-baptiste.mazoyer@ville-rocher.fr")
      ).toEqual("PERSONAL");
    });

    it("matches firstname_lastname with underscore", () => {
      expect(
        getUserStructureEmailStatus("jean_dupont@asso-leblanc.fr")
      ).toEqual("PERSONAL");
    });

    it("matches lastname.initial (dupont.j)", () => {
      expect(getUserStructureEmailStatus("dupont.j@asso-marchand.fr")).toEqual(
        "PERSONAL"
      );
    });

    it("matches multi-segment composite name (abdel-ouahab.bejdadi)", () => {
      expect(
        getUserStructureEmailStatus("abdel-ouahab.bejdadi@asso-fontaine.fr")
      ).toEqual("PERSONAL");
    });

    it("matches initial+lastname under 15 chars (ahardine)", () => {
      expect(getUserStructureEmailStatus("ahardine@mairie-leveque.fr")).toEqual(
        "PERSONAL"
      );
    });

    it("matches initial+lastname (aametowanou)", () => {
      expect(
        getUserStructureEmailStatus("aametowanou@mairie-rocher.fr")
      ).toEqual("PERSONAL");
    });

    it("matches name on public domain (jean.dupont@gmail)", () => {
      expect(getUserStructureEmailStatus("jean.dupont@gmail.com")).toEqual(
        "PERSONAL"
      );
    });

    it("matches deep multi-segment (a.bonnet-de-viller)", () => {
      expect(
        getUserStructureEmailStatus("a.bonnet-de-viller@samusocial-fabre.fr")
      ).toEqual("PERSONAL");
    });
  });

  describe("GENERIC_SUSPECTED — no rule matches", () => {
    it("falls back on random alphanum (xyz123)", () => {
      expect(getUserStructureEmailStatus("xyz123@asso-rocher.fr")).toEqual(
        "GENERIC_SUSPECTED"
      );
    });

    it("falls back on locals too short for personal pattern (abc)", () => {
      expect(getUserStructureEmailStatus("abc@asso-fontaine.fr")).toEqual(
        "GENERIC_SUSPECTED"
      );
    });

    it("falls back on s1-instructeur style technical login", () => {
      expect(getUserStructureEmailStatus("s1-instructeur@yopmail.com")).toEqual(
        "GENERIC_SUSPECTED"
      );
    });

    it("returns GENERIC_SUSPECTED on null", () => {
      expect(getUserStructureEmailStatus(null)).toEqual("GENERIC_SUSPECTED");
    });

    it("returns GENERIC_SUSPECTED on undefined", () => {
      expect(getUserStructureEmailStatus(undefined)).toEqual(
        "GENERIC_SUSPECTED"
      );
    });

    it("returns GENERIC_SUSPECTED on empty string", () => {
      expect(getUserStructureEmailStatus("")).toEqual("GENERIC_SUSPECTED");
    });

    it("returns GENERIC_SUSPECTED on whitespace-only", () => {
      expect(getUserStructureEmailStatus("   ")).toEqual("GENERIC_SUSPECTED");
    });

    it("returns GENERIC_SUSPECTED on missing @", () => {
      expect(getUserStructureEmailStatus("no-at-sign")).toEqual(
        "GENERIC_SUSPECTED"
      );
    });

    it("returns GENERIC_SUSPECTED on missing local part", () => {
      expect(getUserStructureEmailStatus("@asso-rocher.fr")).toEqual(
        "GENERIC_SUSPECTED"
      );
    });

    it("returns GENERIC_SUSPECTED on missing domain part", () => {
      expect(getUserStructureEmailStatus("user@")).toEqual("GENERIC_SUSPECTED");
    });
  });

  describe("startsWith only — generic words in the middle do not match", () => {
    it("equipe.ccas is treated as a name pattern, not generic", () => {
      expect(
        getUserStructureEmailStatus("equipe.ccas@village-rocher.fr")
      ).toEqual("PERSONAL");
    });

    it("xyz-mdph is treated as a name pattern, not generic", () => {
      expect(getUserStructureEmailStatus("xyz-mdph@dept-fabre.fr")).toEqual(
        "PERSONAL"
      );
    });
  });

  describe("normalization", () => {
    it("is case-insensitive (CONTACT@…)", () => {
      expect(getUserStructureEmailStatus("CONTACT@asso-rocher.fr")).toEqual(
        "GENERIC_CONFIRMED"
      );
    });

    it("trims surrounding whitespace", () => {
      expect(
        getUserStructureEmailStatus("  Jean.Dupont@asso-fabre.fr  ")
      ).toEqual("PERSONAL");
    });
  });
});
