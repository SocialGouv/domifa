import { validate } from "class-validator";
import { RegisterUserSupervisorDto } from "../register-user-supervisor.dto";

// Le rôle `super-admin-domifa` est volontairement absent du DTO. Sa
// création/promotion se fait hors UI (migration SQL).
describe("RegisterUserSupervisorDto — super-admin-domifa role assignment", () => {
  const createBaseDto = (): RegisterUserSupervisorDto => {
    const dto = new RegisterUserSupervisorDto();
    dto.nom = "Smith";
    dto.prenom = "John";
    dto.email = "test@example.com";
    dto.role = "national";
    dto.territories = [];
    return dto;
  };

  it("accepts a valid `national` role", async () => {
    const dto = createBaseDto();
    dto.role = "national";
    const errors = await validate(dto);
    const roleErrors = errors.filter((e) => e.property === "role");
    expect(roleErrors).toHaveLength(0);
  });

  it("accepts `region` and `department` roles", async () => {
    for (const role of ["region", "department"] as const) {
      const dto = createBaseDto();
      dto.role = role;
      dto.territories = role === "region" ? ["75"] : ["75"];
      const errors = await validate(dto);
      const roleErrors = errors.filter((e) => e.property === "role");
      expect(roleErrors).toHaveLength(0);
    }
  });

  it("rejects `super-admin-domifa` even with a valid social.gouv email", async () => {
    const dto = createBaseDto();
    dto.email = "john.smith@fabrique.social.gouv.fr";
    dto.role = "super-admin-domifa";

    const errors = await validate(dto);
    const roleError = errors.find((e) => e.property === "role");

    expect(roleError).toBeDefined();
    expect(roleError?.constraints?.isIn).toBeDefined();
  });

  it("rejects `super-admin-domifa` with any email", async () => {
    const dto = createBaseDto();
    dto.role = "super-admin-domifa";

    const errors = await validate(dto);
    const roleError = errors.find((e) => e.property === "role");

    expect(roleError).toBeDefined();
  });
});
