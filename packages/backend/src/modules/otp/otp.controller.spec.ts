import { HttpException, HttpStatus, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { NestExpressApplication } from "@nestjs/platform-express";
import supertest from "supertest";

import { OtpController } from "./otp.controller";
import { OtpService } from "./services/otp.service";

class NoopThrottlerGuard {
  canActivate() {
    return true;
  }
}

describe("OtpController (HTTP)", () => {
  let app: NestExpressApplication;
  let otpService: { generateAndSend: jest.Mock; verify: jest.Mock };

  beforeAll(async () => {
    otpService = {
      generateAndSend: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])],
      controllers: [OtpController],
      providers: [
        { provide: OtpService, useValue: otpService },
        { provide: APP_GUARD, useClass: NoopThrottlerGuard },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useClass(NoopThrottlerGuard)
      .compile();

    app = module.createNestApplication<NestExpressApplication>();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        stopAtFirstError: true,
        transform: true,
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    otpService.generateAndSend.mockReset();
    otpService.verify.mockReset();
  });

  describe("POST /otp/generate", () => {
    it("returns the service result, lower-cases the email, and trims purpose", async () => {
      const expiresAt = new Date(Date.now() + 600_000);
      otpService.generateAndSend.mockResolvedValue({
        success: true,
        expiresAt,
      });

      const res = await supertest(app.getHttpServer())
        .post("/otp/generate")
        .send({ email: "User@Example.com", purpose: "  login-2fa  " })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({
        success: true,
        expiresAt: expiresAt.toISOString(),
      });
      expect(otpService.generateAndSend).toHaveBeenCalledTimes(1);
      const dto = otpService.generateAndSend.mock.calls[0][0];
      expect(dto.email).toBe("user@example.com");
      expect(dto.purpose).toBe("login-2fa");
    });

    it("rejects a missing email", async () => {
      await supertest(app.getHttpServer())
        .post("/otp/generate")
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
      expect(otpService.generateAndSend).not.toHaveBeenCalled();
    });

    it("rejects a malformed email", async () => {
      await supertest(app.getHttpServer())
        .post("/otp/generate")
        .send({ email: "not-an-email" })
        .expect(HttpStatus.BAD_REQUEST);
      expect(otpService.generateAndSend).not.toHaveBeenCalled();
    });

    it("rejects an oversized purpose (> 100 chars)", async () => {
      await supertest(app.getHttpServer())
        .post("/otp/generate")
        .send({ email: "u@example.com", purpose: "x".repeat(101) })
        .expect(HttpStatus.BAD_REQUEST);
      expect(otpService.generateAndSend).not.toHaveBeenCalled();
    });

    it("propagates a TOO_MANY_REQUESTS thrown by the service", async () => {
      otpService.generateAndSend.mockRejectedValue(
        new HttpException("Trop de demandes", HttpStatus.TOO_MANY_REQUESTS)
      );

      await supertest(app.getHttpServer())
        .post("/otp/generate")
        .send({ email: "u@example.com" })
        .expect(HttpStatus.TOO_MANY_REQUESTS);
    });
  });

  describe("POST /otp/verify", () => {
    it("returns valid=true when the service claims the OTP", async () => {
      otpService.verify.mockResolvedValue({ valid: true });

      const res = await supertest(app.getHttpServer())
        .post("/otp/verify")
        .send({ email: "U@Example.com", code: " 123456 " })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({ valid: true });
      const dto = otpService.verify.mock.calls[0][0];
      expect(dto.email).toBe("u@example.com");
      expect(dto.code).toBe("123456");
    });

    it("returns valid=false without reason on invalid code", async () => {
      otpService.verify.mockResolvedValue({ valid: false });

      const res = await supertest(app.getHttpServer())
        .post("/otp/verify")
        .send({ email: "u@example.com", code: "000000" })
        .expect(HttpStatus.CREATED);

      expect(res.body).toEqual({ valid: false });
      expect(res.body).not.toHaveProperty("reason");
    });

    it("rejects a code with wrong length", async () => {
      await supertest(app.getHttpServer())
        .post("/otp/verify")
        .send({ email: "u@example.com", code: "12345" })
        .expect(HttpStatus.BAD_REQUEST);
      expect(otpService.verify).not.toHaveBeenCalled();
    });

    it("rejects a non-numeric code", async () => {
      await supertest(app.getHttpServer())
        .post("/otp/verify")
        .send({ email: "u@example.com", code: "12345A" })
        .expect(HttpStatus.BAD_REQUEST);
      expect(otpService.verify).not.toHaveBeenCalled();
    });

    it("rejects a missing code", async () => {
      await supertest(app.getHttpServer())
        .post("/otp/verify")
        .send({ email: "u@example.com" })
        .expect(HttpStatus.BAD_REQUEST);
      expect(otpService.verify).not.toHaveBeenCalled();
    });
  });
});
