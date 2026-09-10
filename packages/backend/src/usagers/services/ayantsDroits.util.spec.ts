import { validate as isUuid } from "uuid";
import { UsagerAyantDroit } from "@domifa/common";
import { withAyantsDroitsUuid } from "./ayantsDroits.util";

const baseAyantDroit = (
  overrides: Partial<UsagerAyantDroit> = {}
): Partial<UsagerAyantDroit> => ({
  nom: "Doe",
  prenom: "Jane",
  lien: "ENFANT",
  dateNaissance: new Date("2015-05-02T00:00:00.000Z"),
  ...overrides,
});

describe("withAyantsDroitsUuid", () => {
  it("returns an empty array when there is nothing to process", () => {
    expect(withAyantsDroitsUuid()).toEqual([]);
    expect(withAyantsDroitsUuid([])).toEqual([]);
  });

  it("assigns a fresh uuid to each ayant droit that has none", () => {
    const result = withAyantsDroitsUuid([
      baseAyantDroit({ prenom: "Jane" }),
      baseAyantDroit({ prenom: "John" }),
    ]);

    expect(result).toHaveLength(2);
    result.forEach((ayantDroit) => expect(isUuid(ayantDroit.uuid)).toBe(true));
    expect(result[0].uuid).not.toEqual(result[1].uuid);
  });

  it("keeps an incoming uuid that already belongs to the dossier", () => {
    const uuid = "11111111-1111-4111-8111-111111111111";
    const existing: UsagerAyantDroit[] = [
      baseAyantDroit({ uuid }) as UsagerAyantDroit,
    ];
    const [result] = withAyantsDroitsUuid([baseAyantDroit({ uuid })], existing);
    expect(result.uuid).toEqual(uuid);
  });

  it("keeps a round-tripped uuid even when identity fields changed (rename)", () => {
    const uuid = "55555555-5555-4555-8555-555555555555";
    const existing: UsagerAyantDroit[] = [
      baseAyantDroit({ uuid, prenom: "Jane" }) as UsagerAyantDroit,
    ];
    // same row, renamed, uuid sent back by the form
    const [result] = withAyantsDroitsUuid(
      [baseAyantDroit({ uuid, prenom: "Janet" })],
      existing
    );
    expect(result.uuid).toEqual(uuid);
    expect(result.prenom).toEqual("Janet");
  });

  it("ignores an incoming uuid unknown to the dossier (creation / forged id)", () => {
    const forged = "99999999-9999-4999-8999-999999999999";
    const [result] = withAyantsDroitsUuid([baseAyantDroit({ uuid: forged })]);
    expect(result.uuid).not.toEqual(forged);
    expect(isUuid(result.uuid)).toBe(true);
  });

  it("reuses the uuid of a matching existing ayant droit (edit path)", () => {
    const existing: UsagerAyantDroit[] = [
      baseAyantDroit({
        uuid: "22222222-2222-4222-8222-222222222222",
      }) as UsagerAyantDroit,
    ];

    // form sends the ayant droit back without its uuid
    const [result] = withAyantsDroitsUuid([baseAyantDroit()], existing);

    expect(result.uuid).toEqual(existing[0].uuid);
  });

  it("generates a new uuid for a newly added ayant droit while preserving the others", () => {
    const existing: UsagerAyantDroit[] = [
      baseAyantDroit({
        prenom: "Jane",
        uuid: "33333333-3333-4333-8333-333333333333",
      }) as UsagerAyantDroit,
    ];

    const result = withAyantsDroitsUuid(
      [baseAyantDroit({ prenom: "Jane" }), baseAyantDroit({ prenom: "Paul" })],
      existing
    );

    expect(result[0].uuid).toEqual(existing[0].uuid);
    expect(isUuid(result[1].uuid)).toBe(true);
    expect(result[1].uuid).not.toEqual(existing[0].uuid);
  });

  it("does not assign the same existing uuid twice", () => {
    const existing: UsagerAyantDroit[] = [
      baseAyantDroit({
        uuid: "44444444-4444-4444-8444-444444444444",
      }) as UsagerAyantDroit,
    ];

    // two identical incoming ayants droit, only one existing match
    const result = withAyantsDroitsUuid(
      [baseAyantDroit(), baseAyantDroit()],
      existing
    );

    expect(result[0].uuid).toEqual(existing[0].uuid);
    expect(result[1].uuid).not.toEqual(result[0].uuid);
    expect(new Set(result.map((a) => a.uuid)).size).toBe(2);
  });
});
