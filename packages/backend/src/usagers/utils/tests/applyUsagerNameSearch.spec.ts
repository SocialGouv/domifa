import { applyUsagerNameSearch } from "../applyUsagerNameSearch";

type FakeQuery = {
  andWhere: jest.Mock;
  conditions: string[];
  parameters: Record<string, string>;
};

const fakeQuery = (): FakeQuery => {
  const query: FakeQuery = {
    conditions: [],
    parameters: {},
    andWhere: jest.fn((condition: string, params: Record<string, string>) => {
      query.conditions.push(condition);
      Object.assign(query.parameters, params);
      return query;
    }),
  };
  return query;
};

const run = (searchString: string) => {
  const query = fakeQuery();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyUsagerNameSearch(query as any, searchString);
  return query;
};

// L'interface exige que TOUS les mots saisis soient présents, dans n'importe
// quel ordre. Un ILIKE unique sur la saisie brute ne le fait pas : il impose
// l'ordre et la contiguïté, et ne normalise pas les accents alors que la
// colonne indexée, elle, est normalisée.
describe("applyUsagerNameSearch", () => {
  it("exige chaque mot séparément, donc autorise le désordre", () => {
    const query = run("dupont marie");

    expect(query.conditions).toEqual([
      "nom_prenom_surnom_ref ILIKE :searchWord0",
      "nom_prenom_surnom_ref ILIKE :searchWord1",
    ]);
    expect(query.parameters).toEqual({
      searchWord0: "%dupont%",
      searchWord1: "%marie%",
    });
  });

  it("normalise la saisie comme la colonne indexée", () => {
    expect(run("Chloé").parameters).toEqual({ searchWord0: "%chloe%" });
    expect(run("Lœwenberg").parameters).toEqual({
      searchWord0: "%loewenberg%",
    });
  });

  it("découpe sur la ponctuation, comme le fait l'indexation", () => {
    expect(run("Dupont-Lachapelle").parameters).toEqual({
      searchWord0: "%dupont%",
      searchWord1: "%lachapelle%",
    });
  });

  it("ignore les espaces superflus", () => {
    expect(run("  dupont   marie  ").parameters).toEqual({
      searchWord0: "%dupont%",
      searchWord1: "%marie%",
    });
  });

  it("n'ajoute aucune condition pour une saisie vide", () => {
    expect(run("").conditions).toEqual([]);
    expect(run("   ").conditions).toEqual([]);
  });

  it("nomme les paramètres sans collision", () => {
    const query = run("un deux trois");

    expect(Object.keys(query.parameters).sort()).toEqual([
      "searchWord0",
      "searchWord1",
      "searchWord2",
    ]);
  });
});
