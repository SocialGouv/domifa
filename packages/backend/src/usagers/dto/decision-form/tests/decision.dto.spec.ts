import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { DecisionDto } from "../decision.dto";

const base = {
  statut: "VALIDE",
  dateDebut: "2024-01-01T00:00:00.000Z",
  dateFin: "2025-01-01T00:00:00.000Z",
};

describe("DecisionDto — conditional fields", () => {
  it("nulls refusal fields on a VALIDE decision instead of persisting them", async () => {
    const dto = plainToInstance(DecisionDto, {
      ...base,
      motif: "AUTRE",
      motifDetails: "x".repeat(50_000),
      orientation: "asso",
      orientationDetails: { injected: true },
    });
    const errors = await validate(dto, { whitelist: true });
    expect(errors).toHaveLength(0);
    expect(dto.motif).toBeNull();
    expect(dto.motifDetails).toBeNull();
    expect(dto.orientation).toBeNull();
    expect(dto.orientationDetails).toBeNull();
  });

  it("requires motifDetails when statut is REFUS with motif AUTRE", async () => {
    const dto = plainToInstance(DecisionDto, {
      statut: "REFUS",
      dateFin: "2025-01-01T00:00:00.000Z",
      motif: "AUTRE",
      orientation: "asso",
      orientationDetails: "Orientation vers une association",
    });
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property)).toEqual(["motifDetails"]);
  });

  it("keeps and validates refusal fields on a REFUS decision", async () => {
    const dto = plainToInstance(DecisionDto, {
      statut: "REFUS",
      dateDebut: "2024-01-01T00:00:00.000Z",
      dateFin: "2025-01-01T00:00:00.000Z",
      motif: "AUTRE",
      motifDetails: "Motif détaillé du refus",
      orientation: "asso",
      orientationDetails: "Orientation vers une association",
    });
    const errors = await validate(dto, { whitelist: true });
    expect(errors).toHaveLength(0);
    expect(dto.motifDetails).toEqual("Motif détaillé du refus");
    expect(dto.dateDebut).toBeNull();
  });

  it("nulls dateDebut and dateFin while the request is still in progress", async () => {
    const dto = plainToInstance(DecisionDto, {
      statut: "INSTRUCTION",
      dateDebut: "not-a-date",
      dateFin: "not-a-date",
    });
    const errors = await validate(dto, { whitelist: true });
    expect(errors).toHaveLength(0);
    expect(dto.dateDebut).toBeNull();
    expect(dto.dateFin).toBeNull();
  });
});
