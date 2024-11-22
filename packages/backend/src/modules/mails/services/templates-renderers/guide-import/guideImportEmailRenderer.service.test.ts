import { readFile, writeFile } from "fs-extra";
import { join } from "path";

import { format } from "prettier";
import { domifaConfig } from "../../../../../config";
import { guideImportEmailRenderer } from "./guideImportEmailRenderer.service";
describe("guideImportEmailRenderer", () => {
  it("guideImportEmailRenderer render ", async () => {
    const model = {
      prenom: "Paul",
      lienImport: "https://domifa/import",
      lienGuide: "https://domifa/guide",
      lienFaq: "https://domifa/faq",
    };
    const { subject, text, html } =
      await guideImportEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[DOMIFA] Importer vos domiciliés sur DomiFa`);
    expect(text).toContain(model.prenom);
    expect(text).toContain(model.lienImport);
    expect(text).toContain(model.lienFaq);
    expect(text).toContain(model.lienGuide);

    if (domifaConfig().envId === "local") {
      await writeFile(
        join(
          __dirname,
          "../../../../../_static/email-templates",
          "guide-import",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await readFile(
      join(
        __dirname,
        "../../../../../_static/email-templates",
        "guide-import",
        "test.ref.html"
      ),
      "utf-8"
    );
    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});
