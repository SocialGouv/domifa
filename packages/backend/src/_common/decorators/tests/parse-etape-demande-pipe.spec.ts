import { parseEtapeDemande } from "../parse-pipes/ParseEtapeDemande.pipe";

describe("parseEtapeDemande", () => {
  it.each(["0", "1", "2", "3", "4", "5"])("accepts %s", (value) => {
    expect(parseEtapeDemande(value)).toEqual(Number(value));
  });

  it.each(["-1", "6", "999", "03", "1.0", "", "a", undefined, 3])(
    "rejects %p",
    (value) => {
      expect(parseEtapeDemande(value)).toBeNull();
    }
  );
});
