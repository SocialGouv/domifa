import { addHours } from "date-fns";
import { BadRequestException, Injectable } from "@nestjs/common";

import { UserStructureAuthenticated } from "../../../_common/model";
import {
  myDataSource,
  userStructureRepository,
  userStructureSecurityRepository,
  UserStructureSecurityTable,
  UserStructureTable,
} from "../../../database";
import { domifaConfig } from "../../../config";
import { appLogger, tokenGenerator } from "../../../util";
import { isDeletedEmail } from "../../mails/services/brevo-sender/deleted-email.guard";
import { terminateUserSession } from "./userSessionTerminator.service";

const CONFIRMATION_VALIDITY_HOURS = 24;

export type EmailUpdateRequestResult =
  | { alreadyUsed: true }
  | {
      alreadyUsed: false;
      oldEmail: string;
      newEmail: string;
      prenom: string;
      lien: string;
    };

@Injectable()
export class UserStructureEmailUpdaterService {
  // Demande de changement : n'écrit jamais directement `email`. Génère un
  // token de confirmation à usage unique (même mécanisme que le reset
  // password sur `user_structure_security.temporaryTokens`), à envoyer par
  // mail à la nouvelle adresse.
  public async requestEmailUpdate({
    user,
    newEmail,
  }: {
    user: UserStructureAuthenticated;
    newEmail: string;
  }): Promise<EmailUpdateRequestResult> {
    if (newEmail === user.email.toLowerCase()) {
      throw new BadRequestException("SAME_EMAIL");
    }

    if (isDeletedEmail(newEmail)) {
      throw new BadRequestException("BAD_REQUEST");
    }

    const domain = newEmail.split("@")[1];
    if (domifaConfig().security.loginOtpBypassDomains.includes(domain)) {
      throw new BadRequestException("BAD_REQUEST");
    }

    const existing = await userStructureRepository.findOneBy({
      email: newEmail,
    });
    if (existing) {
      // Pas d'oracle : le contrôleur répond comme en cas de succès, sans
      // écrire de token ni logguer/envoyer de mail pour cette demande.
      return { alreadyUsed: true };
    }

    const token = tokenGenerator.generateToken({ length: 30 });
    const validity = addHours(new Date(), CONFIRMATION_VALIDITY_HOURS);

    // Un seul slot de token par compte (comme create-user/reset-password) :
    // une nouvelle demande — email ou reset password — écrase la précédente.
    await userStructureSecurityRepository.update(
      { userId: user.id },
      { temporaryTokens: { type: "email-change", token, validity, newEmail } }
    );

    // uuid plutôt que id : évite d'exposer un identifiant énumérable dans le
    // lien mailé.
    const lien = `${
      domifaConfig().apps.frontendUrl
    }users/confirm-email-update/${user.uuid}/${token}`;

    return {
      alreadyUsed: false,
      oldEmail: user.email,
      newEmail,
      prenom: user.prenom,
      lien,
    };
  }

  // Confirmation : appelée depuis la page publique atteinte via le lien
  // mailé. Réutilise le pattern anti-replay du reset password : le token est
  // invalidé avant d'appliquer le changement.
  public async confirmEmailUpdate({
    uuid,
    token,
  }: {
    uuid: string;
    token: string;
  }): Promise<{
    id: number;
    role: UserStructureAuthenticated["role"];
    structureId: number;
    prenom: string;
    nom: string;
    oldEmail: string;
    newEmail: string;
  }> {
    const user = await userStructureRepository.findOneBy({ uuid });
    const userSecurity = user
      ? await userStructureSecurityRepository.findOneBy({ userId: user.id })
      : null;

    if (!user || user.status === "DELETE" || user.status === "BLOCKED") {
      appLogger.warn(
        `[confirmEmailUpdate] compte introuvable ou inactif (uuid=${uuid})`
      );
      throw new BadRequestException("TOKEN_INVALID");
    }

    if (userSecurity?.temporaryTokens?.type !== "email-change") {
      appLogger.warn(
        `[confirmEmailUpdate] aucune demande de changement d'email en attente (userId=${user.id})`
      );
      throw new BadRequestException("TOKEN_INVALID");
    }

    if (userSecurity.temporaryTokens.token !== token) {
      appLogger.warn(`[confirmEmailUpdate] token invalide (userId=${user.id})`);
      throw new BadRequestException("TOKEN_INVALID");
    }

    if (new Date(userSecurity.temporaryTokens.validity) < new Date()) {
      appLogger.warn(`[confirmEmailUpdate] token expiré (userId=${user.id})`);
      throw new BadRequestException("TOKEN_INVALID");
    }

    const newEmail = userSecurity.temporaryTokens.newEmail;

    // Re-vérifie : l'adresse a pu être prise par quelqu'un d'autre entre la
    // demande et le clic sur le lien — sinon l'update ci-dessous casserait
    // l'index unique.
    const existing = await userStructureRepository.findOneBy({
      email: newEmail,
    });
    if (existing) {
      appLogger.warn(
        `[confirmEmailUpdate] adresse prise entre-temps (userId=${user.id})`
      );
      throw new BadRequestException("TOKEN_INVALID");
    }

    // Token à usage unique invalidé avant d'appliquer le changement, dans la
    // même transaction que l'update de l'email : un échec partiel laisserait
    // sinon le compte sans token valide ni email à jour.
    await myDataSource.transaction(async (manager) => {
      await manager.update(
        UserStructureSecurityTable,
        { userId: user.id },
        { temporaryTokens: null }
      );
      await manager.update(
        UserStructureTable,
        { id: user.id },
        { email: newEmail }
      );
    });

    await terminateUserSession({
      userProfile: "structure",
      userId: user.id,
      reason: "EMAIL_CHANGED",
      structureId: user.structureId,
      role: user.role,
    });

    return {
      id: user.id,
      role: user.role,
      structureId: user.structureId,
      prenom: user.prenom,
      nom: user.nom,
      oldEmail: user.email,
      newEmail,
    };
  }
}
