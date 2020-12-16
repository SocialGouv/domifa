import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../config";
import { adminBatchsErrorReportSender } from "./adminBatchsErrorReportSender.service";
describe("adminBatchsErrorReportSender", () => {
  it("adminBatchsErrorReportSender render ", async () => {
    const errorsCount = 5;
    const lastErrorDate = new Date("2020-12-15 14:30:00");
    const lastErrorMessage = "This is a serious error";
    const {
      subject,
      text,
      html,
    } = await adminBatchsErrorReportSender._renderMailTemplate({
      errorsCount: 5,
      lastErrorDate,
      lastErrorMessage,
      processIds: ["generate-structures-stats", "mail-import-guide"],
      envId: "test",
    });
    // be sure the count is ok
    expect(subject).toEqual(
      `[DOMIFA][test] Rapport d'erreur (2020-12-15 14:30 - ${errorsCount} erreurs)`
    );
    expect(text).toContain(`${errorsCount} erreurs`);
    expect(text).toContain("generate-structures-stats,mail-import-guide");
    expect(html).toContain(`${errorsCount} erreurs`);

    if (domifaConfig().envId === "dev") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "adminBatchsErrorReportSender.service.test.tmp.html"
        ),
        html
      );
    }

    const refHtml = fs
      .readFileSync(
        path.join(
          __dirname,
          "adminBatchsErrorReportSender.service.test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});
