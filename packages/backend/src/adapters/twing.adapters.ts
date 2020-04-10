import { MailerOptions, TemplateAdapter } from "@nestjs-modules/mailer";
import * as inlineCSS from "inline-css";
import * as path from "path";
import { TwingEnvironment, TwingLoaderFilesystem, TwingTemplate } from "twing";
import { HttpException, HttpStatus } from "@nestjs/common";

export class TwingAdapter implements TemplateAdapter {
  private precompiledTemplates: Map<string, TwingTemplate> = new Map();

  compile(
    mail: any,
    callback: (err?: any, body?: string) => any,
    options: MailerOptions
  ): void {
    const templateExt = path.extname(mail.data.template) || ".twig";
    const templateName = path.basename(mail.data.template, templateExt);
    const templateDir = process.cwd() + "/src/templates/";

    const loader = new TwingLoaderFilesystem(templateDir);
    const twing = new TwingEnvironment(loader);

    this.renderTemplate(twing, templateName + templateExt, mail.data.context)
      .then((html) => {
        mail.data.html = html;

        return callback();
      })
      .catch(callback);
  }

  private async renderTemplate(
    twing: TwingEnvironment,
    template: string,
    context: Record<string, any>
  ): Promise<string> {
    if (!this.precompiledTemplates.has(template))
      this.precompiledTemplates.set(template, await twing.load(template));

    const getTemplate = this.precompiledTemplates.get(template);
    if (typeof getTemplate === "undefined") {
      throw new HttpException(
        "TEMPLATE_MAIL_NOT_FOUND",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const rendered = await getTemplate.render(context);

    return inlineCSS(rendered, { url: " " });
  }
}
