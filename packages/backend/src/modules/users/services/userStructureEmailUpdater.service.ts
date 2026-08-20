import { BadRequestException, Injectable } from "@nestjs/common";

import { UserStructureAuthenticated } from "../../../_common/model";
import { userStructureRepository } from "../../../database";

@Injectable()
export class UserStructureEmailUpdaterService {
  public async updateEmail({
    user,
    newEmail,
  }: {
    user: UserStructureAuthenticated;
    newEmail: string;
  }): Promise<void> {
    // newEmail est déjà normalisé par EmailDto (@LowerCaseTransform), mais
    // user.email peut être un email historique non normalisé.
    if (newEmail === user.email.toLowerCase()) {
      throw new BadRequestException("SAME_EMAIL");
    }

    // Recherche sur toute la base (pas seulement les comptes actifs) : la
    // contrainte unique en base ne distingue pas les comptes soft-deleted,
    // donc un email déjà pris par l'un d'eux ferait de toute façon échouer
    // l'update ci-dessous.
    const existing = await userStructureRepository.findOneBy({
      email: newEmail,
    });
    if (existing) {
      throw new BadRequestException("BAD_REQUEST");
    }

    await userStructureRepository.update({ id: user.id }, { email: newEmail });
  }
}
