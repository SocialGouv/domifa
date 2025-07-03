import { matchFonctionUtilisateur } from "../matchFonctionUtilisateur";

describe("matchFonctionUtilisateur", () => {
  describe("Edge cases", () => {
    it("should return 'Autre' for empty string", () => {
      expect(matchFonctionUtilisateur("")).toBe("Autre");
    });

    it("should return 'Autre' for null input", () => {
      expect(matchFonctionUtilisateur(null as any)).toBe("Autre");
    });

    it("should return 'Autre' for undefined input", () => {
      expect(matchFonctionUtilisateur(undefined as any)).toBe("Autre");
    });

    it("should return null for unrecognized input", () => {
      expect(matchFonctionUtilisateur("fonction inexistante")).toBe(null);
    });
  });

  describe("Exact matches", () => {
    it("should match 'président' exactly", () => {
      expect(matchFonctionUtilisateur("président")).toBe("Président");
    });

    it("should match 'directeur' exactly", () => {
      expect(matchFonctionUtilisateur("directeur")).toBe(
        "Directeur / Responsable"
      );
    });

    it("should match 'maire' exactly", () => {
      expect(matchFonctionUtilisateur("maire")).toBe("Maire");
    });

    it("should match 'dgs' exactly", () => {
      expect(matchFonctionUtilisateur("dgs")).toBe(
        "Directeur général des services (DGS)"
      );
    });

    it("should match 'cesf' exactly", () => {
      expect(matchFonctionUtilisateur("cesf")).toBe(
        "Conseiller en économie sociale et familiale (CESF)"
      );
    });

    it("should match 'bénévole' exactly", () => {
      expect(matchFonctionUtilisateur("bénévole")).toBe("Bénévole");
    });
  });

  describe("Case insensitive matches", () => {
    it("should match 'PRÉSIDENT' in uppercase", () => {
      expect(matchFonctionUtilisateur("PRÉSIDENT")).toBe("Président");
    });

    it("should match 'Directeur' with mixed case", () => {
      expect(matchFonctionUtilisateur("Directeur")).toBe(
        "Directeur / Responsable"
      );
    });

    it("should match 'MAIRE' in uppercase", () => {
      expect(matchFonctionUtilisateur("MAIRE")).toBe("Maire");
    });
  });

  describe("Accent handling", () => {
    it("should match 'president' without accent", () => {
      expect(matchFonctionUtilisateur("president")).toBe("Président");
    });

    it("should match 'secretaire' without accent", () => {
      expect(matchFonctionUtilisateur("secretaire")).toBe(
        "Secrétaire / Assistant administratif"
      );
    });

    it("should match 'benevole' without accent", () => {
      expect(matchFonctionUtilisateur("benevole")).toBe("Bénévole");
    });
  });

  describe("Synonym matches", () => {
    it("should match 'presidente' synonym", () => {
      expect(matchFonctionUtilisateur("presidente")).toBe("Président");
    });

    it("should match 'directrice' synonym", () => {
      expect(matchFonctionUtilisateur("directrice")).toBe(
        "Directeur / Responsable"
      );
    });

    it("should match 'responsable' synonym", () => {
      expect(matchFonctionUtilisateur("responsable")).toBe(
        "Directeur / Responsable"
      );
    });

    it("should match 'assistante sociale' synonym", () => {
      expect(matchFonctionUtilisateur("assistante sociale")).toBe(
        "Travailleur social / Assistant social"
      );
    });

    it("should match 'travailleuse sociale' synonym", () => {
      expect(matchFonctionUtilisateur("travailleuse sociale")).toBe(
        "Travailleur social / Assistant social"
      );
    });

    it("should match 'agent d'accueil' synonym", () => {
      expect(matchFonctionUtilisateur("agent d'accueil")).toBe(
        "Agent d'accueil"
      );
    });

    it("should match 'chef de service' synonym", () => {
      expect(matchFonctionUtilisateur("chef de service")).toBe(
        "Chef de service"
      );
    });

    it("should match 'adjoint administratif' synonym", () => {
      expect(matchFonctionUtilisateur("adjoint administratif")).toBe(
        "Adjoint administratif"
      );
    });
  });

  describe("Complex synonym matches", () => {
    it("should match 'président du ccas' complex synonym", () => {
      expect(matchFonctionUtilisateur("président du ccas")).toBe("Président");
    });

    it("should match 'directeur des services' complex synonym", () => {
      expect(matchFonctionUtilisateur("directeur des services")).toBe(
        "Directeur / Responsable"
      );
    });

    it("should match 'responsable action sociale' complex synonym", () => {
      expect(matchFonctionUtilisateur("responsable action sociale")).toBe(
        "Directeur / Responsable"
      );
    });

    it("should match 'assistante administrative' complex synonym", () => {
      expect(matchFonctionUtilisateur("assistante administrative")).toBe(
        "Secrétaire / Assistant administratif"
      );
    });

    it("should match 'agent d'accueil social' complex synonym", () => {
      expect(matchFonctionUtilisateur("agent d'accueil social")).toBe(
        "Agent d'accueil"
      );
    });
  });

  describe("Partial matches", () => {
    it("should match partial input containing 'président'", () => {
      expect(matchFonctionUtilisateur("je suis président")).toBe("Président");
    });

    it("should match partial input containing 'directeur'", () => {
      expect(matchFonctionUtilisateur("nouveau directeur")).toBe(
        "Directeur / Responsable"
      );
    });

    it("should match when synonym contains the input", () => {
      expect(matchFonctionUtilisateur("maire")).toBe("Maire");
    });
  });

  describe("Special characters and normalization", () => {
    it("should handle special characters in input", () => {
      expect(matchFonctionUtilisateur("président!")).toBe("Président");
    });

    it("should handle multiple spaces", () => {
      expect(matchFonctionUtilisateur("agent   d'accueil")).toBe(
        "Agent d'accueil"
      );
    });

    it("should handle punctuation", () => {
      expect(matchFonctionUtilisateur("président.")).toBe("Président");
    });
  });

  describe("Specific role categories", () => {
    describe("Président category", () => {
      it("should match various président synonyms", () => {
        expect(matchFonctionUtilisateur("présidente")).toBe("Président");
        expect(matchFonctionUtilisateur("presidence")).toBe("Président");
        expect(matchFonctionUtilisateur("président ccas")).toBe("Président");
      });
    });

    describe("Directeur / Responsable category", () => {
      it("should match various directeur synonyms", () => {
        expect(matchFonctionUtilisateur("directrice")).toBe(
          "Directeur / Responsable"
        );
        expect(matchFonctionUtilisateur("responsable")).toBe(
          "Directeur / Responsable"
        );
        expect(matchFonctionUtilisateur("responsable ccas")).toBe(
          "Directeur / Responsable"
        );
      });
    });

    describe("DGS category", () => {
      it("should match DGS variations", () => {
        expect(
          matchFonctionUtilisateur("directrice generale des services")
        ).toBe("Directeur général des services (DGS)");
        expect(matchFonctionUtilisateur("directeur général des services")).toBe(
          "Directeur général des services (DGS)"
        );
      });
    });

    describe("Social worker category", () => {
      it("should match social worker variations", () => {
        expect(matchFonctionUtilisateur("travailleur social")).toBe(
          "Travailleur social / Assistant social"
        );
        expect(matchFonctionUtilisateur("assistant social rr")).toBe(
          "Travailleur social / Assistant social"
        );
        expect(matchFonctionUtilisateur("conseillère sociale")).toBe(
          "Travailleur social / Assistant social"
        );
      });
    });

    describe("Agent d'accueil category", () => {
      it("should match agent variations", () => {
        expect(matchFonctionUtilisateur("agent")).toBe("Agent d'accueil");
        expect(matchFonctionUtilisateur("agent ccas")).toBe("Agent d'accueil");
        expect(matchFonctionUtilisateur("accueillant")).toBe("Agent d'accueil");
      });
    });

    describe("CESF category", () => {
      it("should match CESF variations", () => {
        expect(matchFonctionUtilisateur("conseillère esf")).toBe(
          "Conseiller en économie sociale et familiale (CESF)"
        );
        expect(
          matchFonctionUtilisateur("conseiller economie sociale et familiale")
        ).toBe("Conseiller en économie sociale et familiale (CESF)");
      });
    });

    describe("Autre category", () => {
      it("should match 'autre' explicitly", () => {
        expect(matchFonctionUtilisateur("autre")).toBe("Autre");
      });

      it("should match vice-président variations", () => {
        expect(matchFonctionUtilisateur("vice-président")).toBe("Autre");
        expect(matchFonctionUtilisateur("vice presidente")).toBe("Autre");
      });

      it("should match test and null values", () => {
        expect(matchFonctionUtilisateur("test")).toBe("Autre");
        expect(matchFonctionUtilisateur("null")).toBe("Autre");
      });
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle typical user input variations", () => {
      expect(matchFonctionUtilisateur("Directrice du CCAS")).toBe(
        "Directeur / Responsable"
      );
      expect(matchFonctionUtilisateur("Secrétaire de mairie")).toBe(
        "Secrétaire / Assistant administratif"
      );
      expect(matchFonctionUtilisateur("Agent social")).toBe("Agent d'accueil");
      expect(matchFonctionUtilisateur("Assistante de service social")).toBe(
        "Travailleur social / Assistant social"
      );
    });

    it("should handle typos in common functions", () => {
      expect(matchFonctionUtilisateur("diretrice")).toBe(
        "Directeur / Responsable"
      );
      expect(matchFonctionUtilisateur("respensable")).toBe(
        "Directeur / Responsable"
      );
      expect(matchFonctionUtilisateur("equipière")).toBe("Bénévole");
    });
  });
});
