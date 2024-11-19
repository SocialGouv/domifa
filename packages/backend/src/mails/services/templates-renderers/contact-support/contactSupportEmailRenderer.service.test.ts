import { readFile, writeFile } from "fs-extra";
import { join } from "path";

import { format } from "prettier";
import { contactSupportEmailRenderer } from ".";
import { domifaConfig } from "../../../../config";
import { ContactSupport } from "../../../../_common/model";

describe("contactSupportEmailRender", () => {
  it("contactSupportEmailRender render ", async () => {
    const model: ContactSupport = {
      userId: 12,
      structureId: 5,
      structureName: "Asso des bois bleus",
      content: `Do esse tempor veniam incididunt deserunt ad labore laboris commodo id exercitation sit. Sunt minim tempor ad quis esse est eiusmod incididunt id dolor adipisicing ex excepteur. Consectetur consectetur dolore tempor nisi enim pariatur. Nostrud ea reprehenderit minim pariatur irure. Velit anim qui veniam et in excepteur duis eiusmod est culpa voluptate enim eiusmod laboris. Ut sunt sint magna ullamco nostrud velit est pariatur sit ea consectetur commodo minim.`,
      subject: "Sujet du mail",
      email: "un-contact-par-mail@test.com",
      name: "Nom de la personne",
    };

    const { subject, text, html } =
      await contactSupportEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[SUPPORT] Sujet du mail - Asso des bois bleus`);
    expect(text).toContain(model.email);
    expect(text).toContain(model.name);
    expect(text).toContain(model.content);
    expect(text).toContain(model.structureName);

    if (domifaConfig().envId === "test") {
      await writeFile(
        join(
          __dirname,
          "../../../../_static/email-templates",
          "contact-support",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await readFile(
      join(
        __dirname,
        "../../../../_static/email-templates",
        "contact-support",
        "test.ref.html"
      ),
      "utf-8"
    );

    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});
