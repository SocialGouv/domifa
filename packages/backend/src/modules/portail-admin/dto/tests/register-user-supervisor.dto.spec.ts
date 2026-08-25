import { plainToInstance } from "class-transformer";
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

describe("RegisterUserSupervisorDto — territories", () => {
  const createDto = (
    role: RegisterUserSupervisorDto["role"],
    territories: unknown
  ): RegisterUserSupervisorDto => {
    const dto = new RegisterUserSupervisorDto();
    dto.nom = "Smith";
    dto.prenom = "John";
    dto.email = "test@example.com";
    dto.role = role;
    dto.territories = territories as string[];
    return dto;
  };
  const territoriesErrors = async (dto: RegisterUserSupervisorDto) =>
    (await validate(dto)).filter((e) => e.property === "territories");

  it("requires an empty list for a national role", async () => {
    expect(await territoriesErrors(createDto("national", []))).toHaveLength(0);
    expect(await territoriesErrors(createDto("national", ["75"]))).toHaveLength(
      1
    );
  });

  it("requires at least one territory for department and region roles", async () => {
    expect(await territoriesErrors(createDto("department", []))).toHaveLength(
      1
    );
    expect(await territoriesErrors(createDto("region", []))).toHaveLength(1);
  });

  it("checks every element against the list matching the role", async () => {
    expect(
      await territoriesErrors(createDto("department", ["75", "93"]))
    ).toHaveLength(0);
    expect(
      await territoriesErrors(createDto("department", ["75", "zzz"]))
    ).toHaveLength(1);
    expect(await territoriesErrors(createDto("region", ["99"]))).toHaveLength(
      1
    );
    expect(await territoriesErrors(createDto("region", ["11"]))).toHaveLength(
      0
    );
  });

  it("bounds each element and the list size", async () => {
    expect(
      await territoriesErrors(createDto("department", ["x".repeat(500)]))
    ).toHaveLength(1);
    expect(
      await territoriesErrors(
        createDto(
          "department",
          Array.from({ length: 200 }, (_, i) => `${i}`)
        )
      )
    ).toHaveLength(1);
  });

  it("sanitizes names", async () => {
    const dto = plainToInstance(RegisterUserSupervisorDto, {
      ...createDto("national", []),
      nom: "  <b>Smith</b>  ",
      prenom: "<script>alert(1)</script>John",
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.nom).toEqual("Smith");
    expect(dto.prenom).toEqual("John");
  });

  it("rejects duplicates, nested arrays and non-string elements", async () => {
    expect(
      await territoriesErrors(createDto("department", ["75", "75"]))
    ).toHaveLength(1);
    expect(
      await territoriesErrors(createDto("department", [["75"]]))
    ).toHaveLength(1);
    expect(await territoriesErrors(createDto("department", [75]))).toHaveLength(
      1
    );
  });
});
