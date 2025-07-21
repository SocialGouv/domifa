import {
  UserFonction,
  UserStructure,
  USER_FONCTION_LABELS,
} from "@domifa/common";
import { FonctionFormatPipe } from "./fonction-format.pipe";

describe("FonctionFormatPipe", () => {
  let pipe: FonctionFormatPipe;

  const INVALID_CASES = [
    null,
    undefined,
    { fonction: null },
    { fonction: undefined },
    {},
  ];

  const VALID_FUNCTIONS = Object.values(UserFonction).filter(
    (f) => f !== UserFonction.AUTRE
  );

  const OTHER_CASES = [
    { fonction: UserFonction.AUTRE, fonctionDetail: "Consultant" },
    { fonction: UserFonction.AUTRE, fonctionDetail: null },
    { fonction: UserFonction.AUTRE, fonctionDetail: "" },
  ];

  beforeEach(() => {
    pipe = new FonctionFormatPipe();
  });

  describe("Invalid cases", () => {
    it.each(INVALID_CASES)('should return "Non renseignée" for %p', (user) => {
      expect(pipe.transform(user as UserStructure)).toBe("Non renseignée");
    });
  });

  describe("Standard functions", () => {
    it.each(VALID_FUNCTIONS)("should return label for %s", (fonction) => {
      const user: UserStructure = {
        fonction,
        fonctionDetail: "ignored",
      } as UserStructure;
      expect(pipe.transform(user)).toBe(USER_FONCTION_LABELS[fonction]);
    });
  });

  describe("OTHER function", () => {
    it("should return label with detail", () => {
      expect(pipe.transform(OTHER_CASES[0] as UserStructure)).toBe(
        `${USER_FONCTION_LABELS[UserFonction.AUTRE]} : Consultant`
      );
    });

    it.each(OTHER_CASES.slice(1))("should return only label for %p", (user) => {
      expect(pipe.transform(user as UserStructure)).toBe(
        USER_FONCTION_LABELS[UserFonction.AUTRE]
      );
    });
  });
});
