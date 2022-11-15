import * as fs from "fs";
import * as path from "path";
import { format } from "prettier";
import { domifaConfig } from "../../../../config";
import { adminBatchsErrorReportEmailRenderer } from "./adminBatchsErrorReportEmailRenderer.service";
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
      await fs.promises.writeFile(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "admin-batchs-error-report",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await fs.promises.readFile(
      path.join(
        __dirname,
        "../../../../_static/email-templates",
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