import { BadRequestException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { SearchUsagerDto } from "../search-usager.dto";

// La liste des radiés s'amorce SANS critère : une saisie vide doit passer.
// Une borne posée en décorateur s'appliquait à la valeur TRANSFORMÉE — donc à
// `null` — et renvoyait 400 sur ce chemin nominal, CI verte à l'appui. La
// borne vit désormais dans le @Transform, sur la saisie brute.
describe("SearchUsagerDto — searchString", () => {
  const build = (body: Record<string, unknown>) =>
    plainToInstance(SearchUsagerDto, body);

  it.each([
    ["absente", { searchStringField: "DEFAULT" }],
    ["null", { searchStringField: "DEFAULT", searchString: null }],
    ["vide", { searchStringField: "DEFAULT", searchString: "" }],
  ])("accepte une saisie %s (amorçage de la liste)", async (_label, body) => {
    const dto = build(body);
    // Clé absente : le @Transform ne tourne pas, la valeur reste `undefined` —
    // tout aussi falsy pour `hasNoCriteria` côté contrôleur.
    expect(dto.searchString ?? null).toBeNull();

    const errors = await validate(dto);
    expect(
      errors.filter((error) => error.property === "searchString")
    ).toEqual([]);
  });

  it("accepte une saisie de 200 caractères", async () => {
    const dto = build({
      searchStringField: "DEFAULT",
      searchString: "a".repeat(200),
    });
    const errors = await validate(dto);
    expect(
      errors.filter((error) => error.property === "searchString")
    ).toEqual([]);
  });

  it("rejette une saisie de 201 caractères, sur la valeur BRUTE", () => {
    expect(() =>
      build({ searchStringField: "DEFAULT", searchString: "a".repeat(201) })
    ).toThrow(BadRequestException);
  });

  it("rejette un corps de 100 ko au lieu de générer un ILIKE par mot", () => {
    expect(() =>
      build({
        searchStringField: "DEFAULT",
        searchString: "mot ".repeat(25_000),
      })
    ).toThrow(BadRequestException);
  });

  it("rejette une saisie non-chaîne en 400, pas en 500", () => {
    expect(() =>
      build({ searchStringField: "DEFAULT", searchString: 12345 })
    ).toThrow(BadRequestException);
  });
});
