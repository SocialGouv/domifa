import { validate } from "class-validator";
import { RegisterUserSupervisorDto } from "../register-user-supervisor.dto";

describe("IsSocialGouvEmailIfSuperAdmin Validator", () => {
  // Utility function to create a base DTO
  const createBaseDto = (): RegisterUserSupervisorDto => {
    const dto = new RegisterUserSupervisorDto();
    dto.nom = "Smith";
    dto.prenom = "John";
    dto.email = "test@example.com";
    dto.role = "national";
    dto.territories = [];
    return dto;
  };

  describe("Super Admin with valid email", () => {
    it("should validate with an email ending with @fabrique.social.gouv.fr", async () => {
      const dto = createBaseDto();
      dto.email = "john.smith@fabrique.social.gouv.fr";
      dto.role = "super-admin-domifa";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should validate with an email ending with @externes.social.gouv.fr", async () => {
      const dto = createBaseDto();
      dto.email = "contractor@externes.social.gouv.fr";
      dto.role = "super-admin-domifa";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should validate with an uppercase email that will be transformed to lowercase", async () => {
      const dto = createBaseDto();
      dto.email = "TEST@FABRIQUE.SOCIAL.GOUV.FR";
      dto.role = "super-admin-domifa";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe("Super Admin with invalid email", () => {
    it("should fail with a domain different from @fabrique.social.gouv.fr or @externes.social.gouv.fr", async () => {
      const dto = createBaseDto();
      dto.email = "test@example.com";
      dto.role = "super-admin-domifa";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const emailError = errors.find((error) => error.property === "email");
      expect(emailError).toBeDefined();
      expect(
        emailError?.constraints?.isSocialGouvEmailIfSuperAdmin
      ).toBeDefined();
    });

    it("should fail with an incorrect subdomain of social.gouv.fr", async () => {
      const dto = createBaseDto();
      dto.email = "test@other.social.gouv.fr";
      dto.role = "super-admin-domifa";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const emailError = errors.find((error) => error.property === "email");
      expect(emailError).toBeDefined();
      expect(
        emailError?.constraints?.isSocialGouvEmailIfSuperAdmin
      ).toBeDefined();
    });

    it("should fail with a malformed email even with the correct domain", async () => {
      const dto = createBaseDto();
      dto.email = "test@fabrique.social.gouv.fr@invalid";
      dto.role = "super-admin-domifa";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("Other roles with different emails", () => {
    it("should validate an email from social.gouv.fr domain for other roles", async () => {
      const dto = createBaseDto();
      dto.email = "test@fabrique.social.gouv.fr";
      dto.role = "admin" as any;

      const errors = await validate(dto);

      const emailErrors = errors.filter(
        (error) =>
          error.property === "email" &&
          error.constraints?.isSocialGouvEmailIfSuperAdmin
      );

      expect(emailErrors.length).toBe(0);
    });
  });

  describe("Role and territory combinations", () => {
    it("should validate when super-admin-domifa role has valid email and empty territories", async () => {
      const dto = createBaseDto();
      dto.email = "admin@fabrique.social.gouv.fr";
      dto.role = "super-admin-domifa";
      dto.territories = [];

      const errors = await validate(dto);

      // Filter to find only errors related to our email validator
      const emailErrors = errors.filter(
        (error) =>
          error.property === "email" &&
          error.constraints?.isSocialGouvEmailIfSuperAdmin
      );

      expect(emailErrors.length).toBe(0);
    });

    it("should not validate when super-admin-domifa role has invalid email even with valid territories", async () => {
      const dto = createBaseDto();
      dto.email = "admin@example.com";
      dto.role = "super-admin-domifa";
      dto.territories = [];

      const errors = await validate(dto);

      const emailError = errors.find(
        (error) =>
          error.property === "email" &&
          error.constraints?.isSocialGouvEmailIfSuperAdmin
      );

      expect(emailError).toBeDefined();
    });
  });
});
