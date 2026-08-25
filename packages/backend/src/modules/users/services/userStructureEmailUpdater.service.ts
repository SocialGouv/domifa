import { addHours } from "date-fns";
import { BadRequestException, Injectable } from "@nestjs/common";

import { UserStructureAuthenticated } from "../../../_common/model";
import {
  userStructureRepository,
  userStructureSecurityRepository,
} from "../../../database";
import { domifaConfig } from "../../../config";
import { tokenGenerator } from "../../../util";
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

    const lien = `${
      domifaConfig().apps.frontendUrl
    }users/confirm-email-update/${user.id}/${token}`;

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
    userId,
    token,
  }: {
    userId: number;
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
    const user = await userStructureRepository.findOneBy({ id: userId });
    const userSecurity = await userStructureSecurityRepository.findOneBy({
      userId,
    });

    if (
      !user ||
      user.status === "DELETE" ||
      user.status === "BLOCKED" ||
      userSecurity?.temporaryTokens?.type !== "email-change" ||
      userSecurity.temporaryTokens.token !== token ||
      !userSecurity.temporaryTokens.newEmail ||
      new Date(userSecurity.temporaryTokens.validity) < new Date()
    ) {
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
      throw new BadRequestException("TOKEN_INVALID");
    }

    // Token à usage unique : invalidé avant d'appliquer, pour qu'un retry
    // concurrent ne puisse pas le rejouer.
    await userStructureSecurityRepository.update(
      { userId },
      { temporaryTokens: null }
    );

    await userStructureRepository.update({ id: userId }, { email: newEmail });

    await terminateUserSession({
      userProfile: "structure",
      userId,
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
