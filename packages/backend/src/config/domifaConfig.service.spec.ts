import { loadConfig, loadEnvWithPreset } from "./domifaConfig.service";
import { DomifaEnv } from "./model";

describe("loadConfig", () => {
  beforeEach(async () => {});

  it("loadConfig TEST (default)", () => {
    const defaultEnv: Partial<DomifaEnv> = {
      DOMIFA_ENV_PRESET: "local-test.preset.env",
      POSTGRES_USERNAME: "value POSTGRES_USERNAME",
      POSTGRES_PASSWORD: "value POSTGRES_PASSWORD",
      POSTGRES_DATABASE: "value POSTGRES_DATABASE",
      DOMIFA_SECURITY_JWT_SECRET: "******************",
      DOMIFA_PRINT_ENV: "false",
      DOMIFA_PRINT_CONFIG: "false",
    };
    const env = loadEnvWithPreset({ defaultEnv });

    const config = loadConfig(env);

    expect(config.envId).toEqual("test");
    expect(config.version).toEqual(process.env.npm_package_version);

    expect(config.apps.frontendUrl).toBeDefined();
    expect(config.apps.frontendUrl).toEqual(
      config.healthz.frontendUrlFromBackend
    );
    expect(config.apps.backendUrl).toBeDefined();

    expect(config.security.corsUrl).toBeUndefined();
    expect(config.security.files.iv).toBeDefined();
    expect(config.security.files.private).toBeDefined();

    expect(config.postgres.host).toBeDefined();
    expect(config.postgres.port).toBeDefined();
    expect(config.postgres.logging).toEqual(["warn"]);
    expect(config.postgres.username).toEqual(env.POSTGRES_USERNAME);
    expect(config.postgres.password).toEqual(env.POSTGRES_PASSWORD);
    expect(config.postgres.database).toEqual(env.POSTGRES_DATABASE);

    expect(config.upload.basePath).toBeDefined();

    expect(config.dev.swaggerEnabled).toEqual(false);
    expect(config.dev.sentry.enabled).toEqual(false);

    expect(config.email.emailsEnabled).toEqual(false);
  });

  it("loadConfig DEV (default)", () => {
    const defaultEnv: Partial<DomifaEnv> = {
      DOMIFA_ENV_PRESET: "local-dev.preset.env",
      POSTGRES_USERNAME: "value POSTGRES_USERNAME",
      POSTGRES_PASSWORD: "value POSTGRES_PASSWORD",
      POSTGRES_DATABASE: "value POSTGRES_DATABASE",
      DOMIFA_SECURITY_JWT_SECRET: "******************",
      DOMIFA_PRINT_ENV: "false",
      DOMIFA_PRINT_CONFIG: "false",
    };
    const env = loadEnvWithPreset({ defaultEnv });
    const config = loadConfig(env);

    expect(config.envId).toEqual("dev");
    expect(config.version).toEqual(process.env.npm_package_version);

    expect(config.apps.frontendUrl).toBeDefined();
    expect(config.apps.backendUrl).toBeDefined();

    expect(config.security.corsUrl).toBeUndefined();
    expect(config.security.files.iv).toBeDefined();
    expect(config.security.files.private).toBeDefined();

    expect(config.postgres.host).toBeDefined();
    expect(config.postgres.port).toBeDefined();
    expect(config.postgres.logging).toEqual(["warn", "migration"]);
    expect(config.postgres.username).toEqual(env.POSTGRES_USERNAME);
    expect(config.postgres.password).toEqual(env.POSTGRES_PASSWORD);
    expect(config.postgres.database).toEqual(env.POSTGRES_DATABASE);

    expect(config.upload.basePath).toBeDefined();

    expect(config.dev.swaggerEnabled).toEqual(true);
    expect(config.dev.sentry.enabled).toEqual(false);

    expect(config.email.emailsEnabled).toEqual(false);

    expect(config.sms.enabled).toEqual(false);
  });

  it("loadConfig PROD (default)", () => {
    const defaultEnv: Partial<DomifaEnv> = {
      DOMIFA_ENV_PRESET: "dist.preset.env",
      DOMIFA_ENV_PRIORITY: "files",
      DOMIFA_ENV_ID: "prod",
      POSTGRES_USERNAME: "value POSTGRES_USERNAME",
      POSTGRES_PASSWORD: "value POSTGRES_PASSWORD",
      POSTGRES_DATABASE: "value POSTGRES_DATABASE",
      DOMIFA_SECURITY_JWT_SECRET: "******************",
      FILES_IV: "******************",
      FILES_PRIVATE: "******************",
      DOMIFA_FRONTEND_URL: "https://domifa.xxx",
      DOMIFA_BACKEND_URL: "https://backend.domifa.xxx",
      DOMIFA_ADMIN_EMAIL: "some@mail.xxx",
      DOMIFA_TIPIMAIL_FROM_EMAIL: "some@mail.xxx",
      DOMIFA_MAIL_SMTP_ID: "TIPIMAIL",
      DOMIFA_MAIL_SMTP_TIPIMAIL_HOST: "xxx",
      DOMIFA_MAIL_SMTP_TIPIMAIL_PORT: "1000",
      DOMIFA_MAIL_SMTP_TIPIMAIL_USER: "xxx",
      DOMIFA_MAIL_SMTP_TIPIMAIL_PASSWORD: "xxx",
      DOMIFA_SMS_API_KEY: "xxx",
      DOMIFA_SMS_ENABLE: "xxx",
      DOMIFA_PHONE_NUMBER_REDIRECT_ALL_TO: "xxx",
      DOMIFA_PRINT_ENV: "false",
      DOMIFA_PRINT_CONFIG: "false",
    };
    const env = loadEnvWithPreset({ defaultEnv });

    const config = loadConfig(env);

    expect(config.envId).toEqual("prod");

    expect(config.security.corsUrl).toEqual(env.DOMIFA_FRONTEND_URL);
    expect(config.security.files.iv).toBeDefined();
    expect(config.security.files.private).toBeDefined();

    expect(config.postgres.host).toBeDefined();
    expect(config.postgres.port).toBeDefined();
    expect(config.postgres.logging).toEqual(false);
    expect(config.postgres.username).toEqual(env.POSTGRES_USERNAME);
    expect(config.postgres.password).toEqual(env.POSTGRES_PASSWORD);
    expect(config.postgres.database).toEqual(env.POSTGRES_DATABASE);

    expect(config.upload.basePath).toBeDefined();

    expect(config.dev.swaggerEnabled).toEqual(false);
    expect(config.dev.sentry.enabled).toEqual(false);

    expect(config.email.emailsEnabled).toEqual(false);
  });
});
