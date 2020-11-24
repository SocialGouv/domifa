import { configTypeOrmLoggerParser } from "./configTypeOrmLoggerParser.service";

describe("configTypeOrmLoggerParser", () => {
  beforeEach(async () => {});

  it("configTypeOrmLoggerParser.getTypeormLoggerOptions simple value", () => {
    expect(
      configTypeOrmLoggerParser.getTypeormLoggerOptions(
        {
          POSTGRES_LOGGING: "true",
        },
        "POSTGRES_LOGGING"
      )
    ).toEqual(true);
    expect(
      configTypeOrmLoggerParser.getTypeormLoggerOptions(
        {
          POSTGRES_LOGGING: "false",
        },
        "POSTGRES_LOGGING"
      )
    ).toEqual(false);
    expect(
      configTypeOrmLoggerParser.getTypeormLoggerOptions(
        {
          POSTGRES_LOGGING: "all",
        },
        "POSTGRES_LOGGING"
      )
    ).toEqual("all");
  });
  it("configTypeOrmLoggerParser.getTypeormLoggerOptions simple value", () => {
    expect(
      configTypeOrmLoggerParser.getTypeormLoggerOptions(
        {
          POSTGRES_LOGGING: "query",
        },
        "POSTGRES_LOGGING"
      )
    ).toEqual(["query"]);
    expect(
      configTypeOrmLoggerParser.getTypeormLoggerOptions(
        {
          POSTGRES_LOGGING: "warn, migration",
        },
        "POSTGRES_LOGGING"
      )
    ).toEqual(["warn", "migration"]);
    expect(
      configTypeOrmLoggerParser.getTypeormLoggerOptions(
        {
          POSTGRES_LOGGING: "query, schema, error, warn, info, log, migration",
        },
        "POSTGRES_LOGGING"
      )
    ).toEqual(["query", "schema", "error", "warn", "info", "log", "migration"]);
  });
  // it("configTypeOrmLoggerParser.getTypeormLoggerOptions invalid value", () => {
  //   expect(
  //     configTypeOrmLoggerParser.getTypeormLoggerOptions(
  //       {
  //         POSTGRES_LOGGING: "invalid-value",
  //       },
  //       "POSTGRES_LOGGING"
  //     )
  //   ).toThrowError();
  // });
});
