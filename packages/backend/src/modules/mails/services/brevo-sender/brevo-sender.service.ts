import { Injectable, Logger } from "@nestjs/common";
import { domifaConfig } from "../../../../config";

import {
  SendSmtpEmail,
  TransactionalEmailsApi,
  ContactsApi,
  CreateContact,
} from "@getbrevo/brevo";
import { readFileSync } from "fs";
import { basename } from "path";
import {
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
  USER_STRUCTURE_ROLES_LABELS,
} from "@domifa/common";
import { isValid } from "date-fns";

import { UserStructureBrevo } from "../../types/UserStructureBrevo.type";

@Injectable()
export class BrevoSenderService {
  private readonly logger = new Logger(BrevoSenderService.name);
  private transactionalEmailsApi: TransactionalEmailsApi;
  private contactsApi: ContactsApi;

  constructor() {
    const config = domifaConfig();

    this.transactionalEmailsApi = new TransactionalEmailsApi();
    this.transactionalEmailsApi.setApiKey(0, config.brevo.apiKey);

    this.contactsApi = new ContactsApi();
    (this.contactsApi as any).authentications.apiKey.apiKey =
      config.brevo.apiKey;
  }

  async sendEmailWithTemplate({
    templateId,
    subject,
    params,
    to,
    attachmentPath,
    attachmentContent,
    attachmentName,
  }: {
    templateId: number;
    subject?: string;
    params: Record<string, any>;
    to?: Array<{ email: string; name: string }>;
    attachmentPath?: string;
    attachmentContent?: string; // base64
    attachmentName?: string;
  }) {
    const config = domifaConfig();

    if (!config.email.emailsEnabled || config.envId === "test") {
      this.logger.log(
        `[EMAILS DISABLED] Email non envoyé - Template ID: ${templateId}, To: ${JSON.stringify(
          to
        )}, Raison: ${
          !config.email.emailsEnabled ? "emailsEnabled=false" : "envId=test"
        }`
      );
      return { messageId: "mock-message-id-emails-disabled" };
    }

    try {
      const sendSmtpEmail = new SendSmtpEmail();

      if (subject) {
        sendSmtpEmail.subject = subject;
      }

      sendSmtpEmail.templateId = templateId;
      sendSmtpEmail.to =
        domifaConfig().envId === "prod"
          ? to
          : [
              {
                email: domifaConfig().email.emailAddressRedirectAllTo,
                name: "DomiFa Préprod",
              },
            ];
      sendSmtpEmail.params = params;

      if (attachmentPath) {
        const fileContent = readFileSync(attachmentPath);
        const base64Content = fileContent.toString("base64");
        const fileName = basename(attachmentPath);

        sendSmtpEmail.attachment = [
          {
            content: base64Content,
            name: fileName,
          },
        ];
      } else if (attachmentContent && attachmentName) {
        sendSmtpEmail.attachment = [
          {
            content: attachmentContent,
            name: attachmentName,
          },
        ];
      }
      console.log(sendSmtpEmail);
      const result = await this.transactionalEmailsApi.sendTransacEmail(
        sendSmtpEmail
      );
      console.log({ result });
      return result;
    } catch (error) {
      console.error("Erreur lors de l'envoi du mail:", error);
      throw error;
    }
  }

  async syncContactToBrevo(user: UserStructureBrevo): Promise<void> {
    const config = domifaConfig();

    if (!config.email.emailsEnabled || config.envId === "test") {
      this.logger.log(
        `[EMAILS DISABLED] Synchronisation Brevo non effectuée pour l'utilisateur ${user.id} (${user.email})`
      );
      return;
    }

    try {
      const createContactBody = new CreateContact();
      createContactBody.email = user.email;
      createContactBody.attributes = {
        USER_PRENOM: user.prenom,
        USER_NOM: user.nom,
        USER_ID: user.id,
        USER_ROLE: USER_STRUCTURE_ROLES_LABELS[user.role],
        USER_DERNIERE_CONNEXION: this.parseTextToBrevoDate(user?.lastLogin),
        USER_DATE_INSCRIPTION: this.parseTextToBrevoDate(user?.createdAt),
        STRUCTURE_NOM: user.structure.nom,
        STRUCTURE_DEPARTEMENT: DEPARTEMENTS_LISTE[user.structure?.departement],
        STRUCTURE_REGION: REGIONS_LISTE[user.structure?.region],
        STRUCTURE_DERNIER_CONNEXION: this.parseTextToBrevoDate(
          user.structure?.lastLogin
        ),
      };
      createContactBody.listIds = [
        parseInt(domifaConfig().brevo.contactsListId, 10),
      ];
      createContactBody.updateEnabled = true;

      await this.contactsApi.createContact(createContactBody);
      this.logger.log(
        `Contact Brevo synchronisé pour l'utilisateur ${user.id} (${user.email})`
      );
    } catch (error) {
      this.logger.warn(
        `Erreur lors de la synchronisation du contact Brevo pour l'utilisateur ${user.id}`,
        error
      );
      throw error;
    }
  }

  async deleteContactFromBrevo(email: string): Promise<void> {
    const config = domifaConfig();

    if (!config.email.emailsEnabled || config.envId === "test") {
      this.logger.log(
        `[EMAILS DISABLED] Suppression Brevo non effectuée pour l'email ${email}`
      );
      return;
    }

    try {
      await this.contactsApi.deleteContact(email);
      this.logger.log(`Contact Brevo supprimé pour l'email ${email}`);
    } catch (error) {
      this.logger.warn(
        `Erreur lors de la suppression du contact Brevo pour l'email ${email}`,
        error
      );
      throw error;
    }
  }

  private parseTextToBrevoDate(
    dateInput: string | Date | null | undefined
  ): string {
    if (!dateInput) {
      return "";
    }

    const date = new Date(dateInput);

    if (isValid(date)) {
      return date.toISOString();
    }

    return "";
  }
}
