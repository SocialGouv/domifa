import { configParser } from "./configParser.service";

describe("configParser", () => {
  beforeEach(async () => {});

  it("configParser.get", () => {
    expect(
      configParser.parseString(
        { POSTGRES_HOST: "localhost", POSTGRES_PORT: "5432" },
        "POSTGRES_HOST"
      )
    ).toEqual("localhost");

    expect(
      configParser.parseString(
        { POSTGRES_HOST: "localhost", POSTGRES_PORT: "5432" },
        "POSTGRES_HOST",
        {
          validValues: ["some-host", "localhost"],
        }
      )
    ).toEqual("localhost");
    // expect(
    //   configParser.parseString(
    //     { POSTGRES_HOST: "localhost", POSTGRES_PORT: "5432" },
    //     "POSTGRES_HOST",
    //     {
    //       validValues: ["some-host", "other-host"],
    //     }
    //   )
    // ).toThrowError();

    expect(
      configParser.parseString({ POSTGRES_PORT: "5432" }, "POSTGRES_HOST", {
        required: false,
      })
    ).toBeUndefined();

    // expect(
    //   configParser.parseString({ POSTGRES_PORT: "5432" }, "POSTGRES_HOST", {
    //     required: true,
    //   })
    // ).toThrowError();
  });
  it("configParser.get default value", () => {
    expect(
      configParser.parseString({ POSTGRES_PORT: "5432" }, "POSTGRES_HOST", {
        defaultValue: "5500",
      })
    ).toEqual("5500");
  });
  it("configParser.parseInteger", () => {
    expect(
      configParser.parseInteger(
        { POSTGRES_HOST: "localhost", POSTGRES_PORT: "5432" },
        "POSTGRES_PORT"
      )
    ).toEqual(5432);
  });
  it("configParser.parseBoolean", () => {
    expect(
      configParser.parseBoolean(
        {
          POSTGRES_HOST: "localhost",
          POSTGRES_PORT: "5432",
          DOMIFA_SWAGGER_ENABLE: "false",
        },
        "DOMIFA_SWAGGER_ENABLE"
      )
    ).toEqual(false);
    expect(
      configParser.parseBoolean(
        {
          POSTGRES_HOST: "localhost",
          POSTGRES_PORT: "5432",
          DOMIFA_SWAGGER_ENABLE: "true",
        },
        "DOMIFA_SWAGGER_ENABLE"
      )
    ).toEqual(true);
  });
  it("configParser.parseDelay", () => {
    expect(
      configParser.parseDelay(
        {
          POSTGRES_HOST: "1 day",
        },
        "POSTGRES_HOST"
      )
    ).toEqual({ amount: 1, unit: "day" });
    expect(
      configParser.parseDelay(
        {
          POSTGRES_HOST: "2 minutes",
        },
        "POSTGRES_HOST"
      )
    ).toEqual({ amount: 2, unit: "minutes" });
    expect(
      configParser.parseDelay({}, "POSTGRES_HOST", { required: false })
    ).toBeUndefined();
  });
});
