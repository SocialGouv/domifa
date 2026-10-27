import { applyUsagerNameSearch } from "../applyUsagerNameSearch";

type FakeQuery = {
  andWhere: jest.Mock;
  conditions: string[];
  parameters: Record<string, string>;
};

const run = (searchString: string): FakeQuery => {
  const query: FakeQuery = {
    conditions: [],
    parameters: {},
    andWhere: jest.fn((condition: string, params: Record<string, string>) => {
      query.conditions.push(condition);
      Object.assign(query.parameters, params);
      return query;
    }),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyUsagerNameSearch(query as any, searchString);
  return query;
};

describe("applyUsagerNameSearch", () => {
  it("requires each word separately, in any order", () => {
    const query = run("dupont marie");

    expect(query.conditions).toEqual([
      "usager.nom_prenom_surnom_ref ILIKE :searchWord0",
      "usager.nom_prenom_surnom_ref ILIKE :searchWord1",
    ]);
    expect(query.parameters).toEqual({
      searchWord0: "%dupont%",
      searchWord1: "%marie%",
    });
  });

  it("normalizes the words like the indexed column", () => {
    expect(run("Chloé").parameters).toEqual({ searchWord0: "%chloe%" });
  });

  it("ignores extra spaces", () => {
    expect(run("  dupont   marie  ").parameters).toEqual({
      searchWord0: "%dupont%",
      searchWord1: "%marie%",
    });
  });

  it("adds no condition for an empty search", () => {
    expect(run("").conditions).toEqual([]);
    expect(run("   ").conditions).toEqual([]);
  });
});
