import * as fs from "fs";
import * as path from "path";
import { format } from "prettier";
import { domifaConfig } from "../../../../config";
import { usagerAppointmentCreatedEmailRenderer } from "./usagerAppointmentCreatedEmailRenderer.service";
describe("usagerAppointmentCreatedEmailRenderer", () => {
  it("usagerAppointmentCreatedEmailRenderer render ", async () => {
    const { subject, text, html } =
      await usagerAppointmentCreatedEmailRenderer.renderTemplate({
        prenom: "Paul",
        usager: "Smith",
        date: "15/12/2020",
        heure: "14:20",
        message: "Petit commentaire concernant le RV.",
      });
    expect(subject).toEqual(
      `[DOMIFA] Prise de rendez-vous entre le demandeur et un collaborateur`
    );
    expect(text).toContain("Paul");
    expect(text).toContain("Smith");
    if (domifaConfig().envId === "local") {
      await fs.promises.writeFile(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "usager-appointment-created",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await fs.promises.readFile(
      path.join(
        __dirname,
        "../../../../_static/email-templates",
        "usager-appointment-created",
        "test.ref.html"
      ),
      "utf-8"
    );

    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});
