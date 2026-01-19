import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { domifaConfigFileLoader } from "./domifaConfigFileLoader.service";

describe("domifaConfigFileLoader.loadEnvFile", () => {
  it("should load an env file located at backend root when executed from TS (ts-jest)", () => {
    // This test is a regression test for path resolution in
    // [`domifaConfigFileLoader.loadEnvFile()`](packages/backend/src/config/domifaConfigFileLoader.service.ts:11)
    // where __dirname points to packages/backend/src/config in ts-jest.

    const backendRoot = join(__dirname, "../../../");
    const filename = ".env.__domifa_test__.env";
    const envFilePath = join(backendRoot, filename);

    const payload = [
      "DOMIFA_TEST_MARKER=ok",
      "DOMIFA_TEST_NUMBER=123",
      "",
    ].join("\n");

    writeFileSync(envFilePath, payload, { encoding: "utf8" });
    expect(existsSync(envFilePath)).toBe(true);

    const env = domifaConfigFileLoader.loadEnvFile(filename);
    // env is typed as Partial<DomifaEnv> which does not include arbitrary keys
    // used only for this regression test.
    expect((env as any).DOMIFA_TEST_MARKER).toBe("ok");
    expect((env as any).DOMIFA_TEST_NUMBER).toBe("123");

    unlinkSync(envFilePath);
  });
});
