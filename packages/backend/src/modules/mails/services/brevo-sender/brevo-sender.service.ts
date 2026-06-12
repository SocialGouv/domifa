import { Injectable } from "@nestjs/common";
import { Not } from "typeorm";
import { domifaConfig } from "../../../../config";

import {
  SendSmtpEmail,
  TransactionalEmailsApi,
  ContactsApi,
  CreateContact,
  SendSmtpEmailReplyTo,
  UpdateContact,
} from "@getbrevo/brevo";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import {
  BrevoBlockedContact,
  BrevoBlockedContactReasonCode,
  BrevoContactStatus,
  BrevoEmailEvent,
  BrevoEmailEventType,
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
  Structure,
  STRUCTURE_DECISION_LABELS,
  USER_STRUCTURE_ROLES_LABELS,
  STRUCTURE_TYPE_LABELS,
  getStructureDecisionMotif,
} from "@domifa/common";
import { isValid } from "date-fns";

import { UserStructureBrevo } from "../../types/UserStructureBrevo.type";

import { appLogger } from "../../../../util";
import { UserProfile, UserSecurity } from "../../../../_common/model";
import { DomifaConfig } from "../../../../config/model/DomifaConfig.type";
import {
  userStructureRepository,
  userSupervisorRepository,
} from "../../../../database";
import { userSecurityResetPasswordInitiator } from "../../../users/services";
import { isDeletedEmail } from "./deleted-email.guard";

// Environments where every Brevo call (send, list sync, contact read, etc.)
// is replaced by an info log and a mocked response: `test` (CI suites must
// stay offline) and `local` (developers shouldn't hammer the shared Brevo
// account from their machine). All other environments hit the real API.
function isBrevoCallSkipped(config: DomifaConfig): boolean {
  return (
    !config.email.emailsEnabled ||
    config.envId === "test" ||
    config.envId === "local"
  );
}

@Injectable()
export class BrevoSenderService {
  private readonly transactionalEmailsApi: TransactionalEmailsApi;
  private readonly contactsApi: ContactsApi;

  constructor() {
    const config = domifaConfig();

    this.transactionalEmailsApi = new TransactionalEmailsApi();
    this.transactionalEmailsApi.setApiKey(0, config.brevo.apiKey);

    this.contactsApi = new ContactsApi();
    (this.contactsApi as any).authentications.apiKey.apiKey =
      config.brevo.apiKey;
  }

  async syncStructureContactToBrevo(structure: Structure): Promise<void> {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      appLogger.info(
        `[EMAILS DISABLED] Synchronisation Brevo non effectuée pour la structure ${structure.id} (${structure.email})`
      );
      return;
    }

    if (isDeletedEmail(structure.email)) {
      appLogger.info(
        `[BREVO SKIP] Structure ${structure.id} a un email préfixé "deleted-", sync Brevo ignorée`
      );
      return;
    }

    try {
      const createContactBody = new CreateContact();
      createContactBody.email = structure.email;
      createContactBody.attributes = {
        STRUCTURE_NOM: structure.nom,
        STRUCTURE_ID: structure.id,
        STRUCTURE_RESPONSABLE_NOM: structure.responsable?.nom,
        STRUCTURE_RESPONSABLE_PRENOM: structure.responsable?.prenom,
        STRUCTURE_STATUT: STRUCTURE_DECISION_LABELS[structure.statut],
        STRUCTURE_STATUT_MOTIF: getStructureDecisionMotif(
          structure.statut,
          structure.decision?.motif
        ),
        STRUCTURE_DEPARTEMENT: structure.departmentName,
        STRUCTURE_REGION: structure?.regionName,
        STRUCTURE_DERNIERE_CONNEXION: this.parseTextToBrevoDate(
          structure.lastLogin
        ),
        STRUCTURE_DATE_INSCRIPTION: this.parseTextToBrevoDate(
          structure.createdAt
        ),
        TYPE_STRUCTURE: STRUCTURE_TYPE_LABELS[structure.structureType],
      };
      createContactBody.listIds = [
        Number.parseInt(domifaConfig().brevo.contactsStructuresListId, 10),
      ];
      createContactBody.updateEnabled = true;

      await this.contactsApi.createContact(createContactBody);
      appLogger.info(
        `Contact Brevo synchronisé pour la structure ${structure.id} (${structure.email})`
      );
    } catch (error) {
      appLogger.warn(
        `Erreur lors de la synchronisation du contact Brevo pour la structure ${structure.id}`,
        error
      );
      throw error;
    }
  }

  async sendEmailWithTemplate({
    templateId,
    subject,
    params,
    to,
    attachmentPath,
    attachmentContent,
    attachmentName,
    replyTo,
  }: {
    templateId: number;
    subject?: string;
    params: Record<string, any>;
    to: Array<{ email: string; name: string }>;
    attachmentPath?: string;
    attachmentContent?: string; // base64
    attachmentName?: string;
    replyTo?: SendSmtpEmailReplyTo;
  }) {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      appLogger.info(
        `[EMAILS DISABLED] Email non envoyé - Template ID: ${templateId}, To: ${JSON.stringify(
          to
        )}, Raison: ${
          config.email.emailsEnabled
            ? `envId=${config.envId}`
            : "emailsEnabled=false"
        }`
      );
      return { messageId: "mock-message-id-emails-disabled" };
    }

    const cleanRecipients = to.filter((t) => !isDeletedEmail(t.email));
    if (cleanRecipients.length === 0) {
      appLogger.info(
        `[BREVO SKIP] Tous les destinataires sont préfixés "deleted-", envoi ignoré (template=${templateId})`
      );
      return { messageId: "mock-message-id-deleted-recipients" };
    }

    try {
      const sendSmtpEmail = new SendSmtpEmail();

      if (subject) {
        sendSmtpEmail.subject = subject;
      }

      sendSmtpEmail.templateId = templateId;
      sendSmtpEmail.to =
        domifaConfig().envId === "prod"
          ? cleanRecipients
          : [
              {
                email: domifaConfig().email.emailAddressRedirectAllTo,
                name: "DomiFa Préprod",
              },
            ];

      sendSmtpEmail.params = params;
      sendSmtpEmail.replyTo = replyTo;

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
      console.info(sendSmtpEmail);
      const result = await this.transactionalEmailsApi.sendTransacEmail(
        sendSmtpEmail
      );
      console.info({ result });
      return result;
    } catch (error) {
      console.error("Erreur lors de l'envoi du mail:", error);
      throw error;
    }
  }

  async syncContactToBrevo(user: UserStructureBrevo): Promise<void> {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      appLogger.info(
        `[EMAILS DISABLED] Synchronisation Brevo non effectuée pour l'utilisateur ${user.id} (${user.email})`
      );
      return;
    }

    if (isDeletedEmail(user.email)) {
      appLogger.info(
        `[BREVO SKIP] Utilisateur ${user.id} a un email préfixé "deleted-", sync Brevo ignorée`
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
        STRUCTURE_STATUT: STRUCTURE_DECISION_LABELS[user.structure.statut],
        STRUCTURE_STATUT_MOTIF: getStructureDecisionMotif(
          user.structure.statut,
          user.structure.decision.motif
        ),
        STRUCTURE_DEPARTEMENT: DEPARTEMENTS_LISTE[user.structure?.departement],
        STRUCTURE_REGION: REGIONS_LISTE[user.structure?.region],
        STRUCTURE_DERNIERE_CONNEXION: this.parseTextToBrevoDate(
          user.structure?.lastLogin
        ),
      };
      createContactBody.listIds = [
        Number.parseInt(domifaConfig().brevo.contactsUsersListId, 10),
      ];
      createContactBody.updateEnabled = true;

      await this.contactsApi.createContact(createContactBody);
      appLogger.info(
        `Contact Brevo synchronisé pour l'utilisateur ${user.id} (${user.email})`
      );
    } catch (error) {
      appLogger.warn(
        `Erreur lors de la synchronisation du contact Brevo pour l'utilisateur ${user.id}`,
        error
      );
      throw error;
    }
  }

  async subscribeToNewsletter(email: string): Promise<void> {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      appLogger.info(
        `[EMAILS DISABLED] Inscription newsletter non effectuée pour l'email ${email}`
      );
      return;
    }

    if (isDeletedEmail(email)) {
      appLogger.info(
        `[BREVO SKIP] Email préfixé "deleted-", inscription newsletter ignorée`
      );
      return;
    }

    if (!config.brevo.newsletterListId) {
      appLogger.warn(
        `[NEWSLETTER] DOMIFA_MAIL_BREVO_NEWSLETTER_LIST_ID non configuré, inscription ignorée`
      );
      return;
    }

    try {
      const createContactBody = new CreateContact();
      createContactBody.email = email;
      createContactBody.listIds = [
        Number.parseInt(config.brevo.newsletterListId, 10),
      ];
      createContactBody.updateEnabled = true;

      await this.contactsApi.createContact(createContactBody);
      appLogger.info(`Contact newsletter Brevo ajouté pour l'email ${email}`);
    } catch (error) {
      appLogger.warn(
        `Erreur lors de l'inscription newsletter Brevo pour l'email ${email}`,
        error
      );
      throw error;
    }
  }

  async deleteContactFromBrevo(email: string): Promise<void> {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      appLogger.info(
        `[EMAILS DISABLED] Suppression Brevo non effectuée pour l'email ${email}`
      );
      return;
    }

    try {
      await this.contactsApi.deleteContact(email);
      appLogger.info(`Contact Brevo supprimé pour l'email ${email}`);
    } catch (error) {
      appLogger.warn(
        `Erreur lors de la suppression du contact Brevo pour l'email ${email}`,
        error
      );
      throw error;
    }
  }

  async sendUserActivationEmail({
    userId,
    userProfile,
    userSecurity,
  }: {
    userId: number;
    userProfile: UserProfile;
    userSecurity: UserSecurity;
  }): Promise<void> {
    const user =
      userProfile === "structure"
        ? await userStructureRepository.findOneBy({
            id: userId,
            status: Not("DELETE"),
          })
        : await userSupervisorRepository.findOneBy({
            id: userId,
            status: Not("DELETE"),
          });

    if (!user) {
      throw new Error(
        `User not found: userId=${userId}, userProfile=${userProfile}`
      );
    }

    const link = userSecurityResetPasswordInitiator.buildResetPasswordLink({
      token: userSecurity.temporaryTokens.token,
      userId: user.id,
      userProfile,
    });

    if (!link) {
      throw new Error(`Failed to generate activation link for user ${userId}`);
    }

    await this.sendEmailWithTemplate({
      templateId: domifaConfig().brevo.templates.userStructureCreatedByAdmin,
      to: [
        {
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
        },
      ],
      params: {
        lien: link,
        prenom: user.prenom,
      },
    });

    appLogger.info(
      `Email d'activation envoyé avec succès à ${user.email} (userId: ${userId}, userProfile: ${userProfile})`
    );
  }

  async getEmailEventsForEmail({
    email,
    limit,
    offset,
    event,
    days,
  }: {
    email: string;
    limit?: number;
    offset?: number;
    event?: BrevoEmailEventType;
    days?: number;
  }): Promise<BrevoEmailEvent[]> {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      appLogger.info(
        `[EMAILS DISABLED] Lecture des événements Brevo non effectuée pour ${email}`
      );
      return [];
    }

    try {
      const { body } = await this.transactionalEmailsApi.getEmailEventReport(
        limit,
        offset,
        undefined,
        undefined,
        days,
        email,
        event,
        undefined,
        undefined,
        undefined,
        "desc"
      );
      return (body.events ?? []) as unknown as BrevoEmailEvent[];
    } catch (error) {
      appLogger.warn(
        `Erreur lors de la récupération des événements Brevo pour ${email}`,
        error
      );
      throw error;
    }
  }

  async getContactStatus({
    email,
  }: {
    email: string;
  }): Promise<BrevoContactStatus> {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      appLogger.info(
        `[EMAILS DISABLED] Lecture du statut Brevo non effectuée pour ${email}`
      );
      return { existsInBrevo: false, emailBlacklisted: false };
    }

    try {
      const { body } = await this.contactsApi.getContactInfo(email);
      return {
        existsInBrevo: true,
        emailBlacklisted: Boolean(body.emailBlacklisted),
        smsBlacklisted: Boolean(body.smsBlacklisted),
        listIds: body.listIds,
        createdAt: body.createdAt,
        modifiedAt: body.modifiedAt,
        id: typeof body.id === "number" ? body.id : undefined,
      };
    } catch (error: any) {
      // Brevo returns 404 when the contact does not exist — that's an expected
      // outcome, not an error to surface.
      const status =
        error?.response?.statusCode ?? error?.response?.status ?? error?.status;
      if (status === 404) {
        return { existsInBrevo: false, emailBlacklisted: false };
      }
      appLogger.warn(
        `Erreur lors de la lecture du statut Brevo pour ${email}`,
        error
      );
      throw error;
    }
  }

  // Clears the contact-level `emailBlacklisted` flag (Brevo Contacts API).
  // Set when a contact unsubscribes from a campaign or is manually blacklisted
  // — this is what blocks marketing/campaign sends. Transactional sends are
  // governed by a separate list (see `unblockBrevoTransactional`).
  // Brevo answers 204 No Content on success.
  async unblockBrevoCampaign({ email }: { email: string }): Promise<void> {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      appLogger.info(
        `[EMAILS DISABLED] Déblocage campagne non effectué pour ${email}`
      );
      return;
    }

    const update = new UpdateContact();
    update.emailBlacklisted = false;
    try {
      await this.contactsApi.updateContact(email, update);
      appLogger.info(`Contact Brevo débloqué côté campagnes: ${email}`);
    } catch (error: any) {
      const status =
        error?.response?.statusCode ?? error?.response?.status ?? error?.status;
      appLogger.warn(
        `Échec PUT /contacts/${email} (status=${status}): ${
          error?.message ?? String(error)
        }`
      );
      throw error;
    }
  }

  // Removes the email from the SMTP transactional blocklist (hard bounces,
  // spam complaints, manual ops blocks). A 404 means "not on the list" which
  // is the expected outcome when an admin pre-emptively unblocks — we swallow
  // it so the UI sees a successful operation.
  async unblockBrevoTransactional({ email }: { email: string }): Promise<void> {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      appLogger.info(
        `[EMAILS DISABLED] Déblocage transactionnel non effectué pour ${email}`
      );
      return;
    }

    try {
      await this.transactionalEmailsApi.smtpBlockedContactsEmailDelete(email);
      appLogger.info(`Contact Brevo retiré de la blocklist SMTP: ${email}`);
    } catch (error: any) {
      const status =
        error?.response?.statusCode ?? error?.response?.status ?? error?.status;
      if (status === 404) {
        appLogger.info(
          `Email ${email} absent de la blocklist SMTP (déjà débloqué)`
        );
        return;
      }
      appLogger.warn(
        `Échec DELETE /smtp/blockedContacts/${email} (status=${status}): ${
          error?.message ?? String(error)
        }`
      );
      throw error;
    }
  }

  // Paginated read of the SMTP transactional blocklist. Returns the full row
  // (email + sender + reason + blockedAt) so the admin UI can show why each
  // contact ended up there. Also used by the bulk-unblock migration which only
  // reads `.email`.
  async listTransactionalBlockedContacts(
    offset: number,
    limit: number
  ): Promise<BrevoBlockedContact[]> {
    const config = domifaConfig();

    if (isBrevoCallSkipped(config)) {
      return [];
    }

    const { body } =
      await this.transactionalEmailsApi.getTransacBlockedContacts(
        undefined,
        undefined,
        limit,
        offset,
        undefined,
        "desc"
      );
    const contacts = (
      body as unknown as {
        contacts?: Array<{
          email?: string;
          senderEmail?: string;
          reason?: { code?: string; message?: string };
          blockedAt?: string;
        }>;
      }
    ).contacts;
    return (contacts ?? [])
      .filter(
        (c): c is { email: string } & Record<string, unknown> =>
          typeof c?.email === "string" && c.email.length > 0
      )
      .map((c) => ({
        email: c.email as string,
        senderEmail:
          typeof c.senderEmail === "string" && c.senderEmail.length > 0
            ? (c.senderEmail as string)
            : null,
        reasonCode:
          ((c.reason as { code?: string } | undefined)?.code as
            | BrevoBlockedContactReasonCode
            | undefined) ?? null,
        reasonMessage:
          (c.reason as { message?: string } | undefined)?.message ?? null,
        blockedAt:
          typeof c.blockedAt === "string" && c.blockedAt.length > 0
            ? new Date(c.blockedAt)
            : null,
      }));
  }

  // Brevo returns the total count in the paginated response envelope, so we
  // ask for the smallest page possible and read `body.count`.
  // Returns null when the call is skipped (offline env) so the caller can
  // distinguish "Brevo disabled" from a real zero.
  async countTransactionalBlocked(): Promise<number | null> {
    const config = domifaConfig();
    if (isBrevoCallSkipped(config)) {
      return null;
    }

    const { body } =
      await this.transactionalEmailsApi.getTransacBlockedContacts(
        undefined,
        undefined,
        1,
        0,
        undefined,
        "desc"
      );
    return typeof body.count === "number" ? body.count : 0;
  }

  // `filter=blacklisted` is Brevo's documented way to narrow GET /contacts to
  // contacts with `emailBlacklisted=true`. We don't need the rows, only the
  // envelope `count`.
  async countCampaignBlacklisted(): Promise<number | null> {
    const config = domifaConfig();
    if (isBrevoCallSkipped(config)) {
      return null;
    }

    const { body } = await this.contactsApi.getContacts(
      1,
      0,
      undefined,
      undefined,
      "desc",
      undefined,
      undefined,
      "blacklisted"
    );
    return typeof body.count === "number" ? body.count : 0;
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
