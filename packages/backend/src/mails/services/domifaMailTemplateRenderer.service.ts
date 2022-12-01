import EmailTemplate from "email-templates";
import { configure } from "nunjucks";
import { join } from "path";

import { DomifaMailTemplateRendering } from "../model";

// @see https://github.com/niftylettuce/email-templates/blob/master/src/index.js
const templateBasePath = join(__dirname, "../../_static/email-templates");

const emailConfig: EmailTemplate.EmailConfig<any> = {
  juice: true,
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: templateBasePath,
    },
  },
  message: undefined,
  views: {
    options: {
      extension: "nunjucks",
    },
    root: templateBasePath,
  },
};

const emailTemplate = new EmailTemplate(emailConfig);

// configure nunjucks working dir so we can use relative path to base.nunjucks template
configure(templateBasePath);

export const domifaMailTemplateRenderer = {
  renderTemplate,
};

async function renderTemplate(
  templateId: string,
  model: any
): Promise<DomifaMailTemplateRendering> {
  const message: Partial<EmailTemplate.EmailMessage> =
    await emailTemplate.renderAll(templateId, model);

  const rendering: DomifaMailTemplateRendering = {
    html: message.html,
    text: message.text,
    subject: message.subject,
  };
  return rendering;
}
