import { validate } from "class-validator";
import { RegisterUserSupervisorDto } from "../../dto";

describe("IsSocialGouvEmailIfSuperAdmin", () => {
  it("should validate when role is super-admin-domifa and email is valid", async () => {
    const dto = new RegisterUserSupervisorDto();
    dto.nom = "test";
    dto.prenom = "test";
    dto.email = "test@fabrique.social.gouv.fr";
    dto.role = "super-admin-domifa";
    dto.territories = [];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate when role is super-admin-domifa and email is valid (externes)", async () => {
    const dto = new RegisterUserSupervisorDto();
    dto.nom = "test";
    dto.prenom = "test";
    dto.email = "test@externes.social.gouv.fr";
    dto.role = "super-admin-domifa";
    dto.territories = [];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should not validate when role is super-admin-domifa and email is invalid", async () => {
    const dto = new RegisterUserSupervisorDto();
    dto.nom = "test";
    dto.prenom = "test";
    dto.email = "test@example.com";
    dto.role = "super-admin-domifa";
    dto.territories = [];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isSocialGouvEmailIfSuperAdmin).toBeDefined();
  });

  it("should validate when role is not super-admin-domifa and email is any valid email", async () => {
    const dto = new RegisterUserSupervisorDto();
    dto.nom = "test";
    dto.prenom = "test";
    dto.email = "test@example.com";
    dto.role = "national";
    dto.territories = [];

    const errors = await validate(dto);

    // S'il y a des erreurs, elles ne doivent pas être liées à la validation de l'email
    const emailErrors = errors.filter(
      (error) =>
        error.property === "email" &&
        error.constraints?.isSocialGouvEmailIfSuperAdmin
    );
    expect(emailErrors.length).toBe(0);
  });
});
