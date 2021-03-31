import { loadConfig } from "./domifaConfig.service";
import { DomifaEnv } from "./model";

describe("loadConfig", () => {
  beforeEach(async () => {});

  it("loadConfig TEST (default)", () => {
    const env: Partial<DomifaEnv> = {
      DOMIFA_ENV_ID: "test",
      POSTGRES_USERNAME: "value POSTGRES_USERNAME",
      POSTGRES_PASSWORD: "value POSTGRES_PASSWORD",
      POSTGRES_DATABASE: "value POSTGRES_DATABASE",
      SECRET: "******************",
    };
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
    expect(config.postgres.logging).toEqual(false);
    expect(config.postgres.username).toEqual(env.POSTGRES_USERNAME);
    expect(config.postgres.password).toEqual(env.POSTGRES_PASSWORD);
    expect(config.postgres.database).toEqual(env.POSTGRES_DATABASE);

    expect(config.upload.basePath).toBeDefined();

    expect(config.dev.swaggerEnabled).toEqual(false);
    expect(config.cron.stats.autoRunOnStartup).toEqual(false);
    expect(config.dev.sentry.enabled).toEqual(false);

    expect(config.email.emailsEnabled).toEqual(false);
  });

  it("loadConfig DEV (default)", () => {
    const env: Partial<DomifaEnv> = {
      DOMIFA_ENV_ID: "dev",
      POSTGRES_USERNAME: "value POSTGRES_USERNAME",
      POSTGRES_PASSWORD: "value POSTGRES_PASSWORD",
      POSTGRES_DATABASE: "value POSTGRES_DATABASE",
      SECRET: "******************",
    };
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
    expect(config.postgres.logging).toEqual(false);
    expect(config.postgres.username).toEqual(env.POSTGRES_USERNAME);
    expect(config.postgres.password).toEqual(env.POSTGRES_PASSWORD);
    expect(config.postgres.database).toEqual(env.POSTGRES_DATABASE);

    expect(config.upload.basePath).toBeDefined();

    expect(config.dev.swaggerEnabled).toEqual(true);
    expect(config.cron.stats.autoRunOnStartup).toEqual(false);
    expect(config.dev.sentry.enabled).toEqual(false);

    expect(config.email.emailsEnabled).toEqual(false);

    expect(config.sms.enabled).toEqual(false);
  });

  it("loadConfig PROD (default)", () => {
    const env: Partial<DomifaEnv> = {
      DOMIFA_ENV_ID: "prod",
      POSTGRES_USERNAME: "value POSTGRES_USERNAME",
      POSTGRES_PASSWORD: "value POSTGRES_PASSWORD",
      POSTGRES_DATABASE: "value POSTGRES_DATABASE",
      SECRET: "******************",
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
    };
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
    expect(config.cron.stats.autoRunOnStartup).toEqual(false);
    expect(config.dev.sentry.enabled).toEqual(false);

    expect(config.email.emailsEnabled).toEqual(true);
  });
});
