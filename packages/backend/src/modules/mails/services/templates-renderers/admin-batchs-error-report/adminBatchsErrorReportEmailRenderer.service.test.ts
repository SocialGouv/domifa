import { writeFile } from "fs-extra";
import { readFile } from "fs/promises";
import { join } from "path";

import { format } from "prettier";
import { adminBatchsErrorReportEmailRenderer } from "./adminBatchsErrorReportEmailRenderer.service";
import { domifaConfig } from "../../../../../config";

describe("adminBatchsErrorReportEmailRenderer", () => {
  it("adminBatchsErrorReportEmailRenderer render ", async () => {
    const errorsCount = 5;
    const lastErrorDate = new Date("2020-12-15 14:30:00");
    const lastErrorMessage = "This is a serious error";
    const { subject, text, html } =
      await adminBatchsErrorReportEmailRenderer.renderTemplate({
        errorsCount: 5,
        lastErrorDate,
        lastErrorMessage,
        processIds: ["mail-import-guide"],
        envId: "test",
      });
    // be sure the count is ok
    expect(subject).toEqual(
      `[DOMIFA][test] Rapport d'erreur (2020-12-15 14:30 - ${errorsCount} erreurs)`
    );
    expect(text).toContain(`${errorsCount} erreurs`);
    expect(text).toContain("mail-import-guide");
    expect(html).toContain(`${errorsCount} erreurs`);

    if (domifaConfig().envId === "local") {
      await writeFile(
        join(
          __dirname,
          "../../../../../_static/email-templates",
          "admin-batchs-error-report",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await readFile(
      join(
        __dirname,
        "../../../../../_static/email-templates",
        "admin-batchs-error-report",
        "test.ref.html"
      ),
      "utf-8"
    );

    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});
