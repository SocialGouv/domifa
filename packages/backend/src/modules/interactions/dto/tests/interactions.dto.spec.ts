import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { InteractionDto } from "../interactions.dto";

describe("InteractionDto — conditional fields", () => {
  it("nulls incoming-only fields on an outgoing interaction", async () => {
    const dto = plainToInstance(InteractionDto, {
      type: "courrierOut",
      content: "x".repeat(100_000),
      nbCourrier: 999,
      procurationIndex: 1,
    });
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.content).toBeNull();
    expect(dto.nbCourrier).toBeNull();
    expect(dto.procurationIndex).toEqual(1);
  });

  it("nulls procurationIndex and validates nbCourrier on an incoming interaction", async () => {
    const dto = plainToInstance(InteractionDto, {
      type: "courrierIn",
      nbCourrier: 999,
      procurationIndex: 1,
    });
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property)).toEqual(["nbCourrier"]);
    expect(dto.procurationIndex).toBeNull();
  });
});
