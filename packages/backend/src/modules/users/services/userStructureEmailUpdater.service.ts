import { BadRequestException, ConflictException } from "@nestjs/common";
import { Not, QueryFailedError } from "typeorm";

import { UserStructureAuthenticated } from "../../../_common/model";
import { userStructureRepository } from "../../../database";

export const userStructureEmailUpdater = {
  updateEmail,
};

async function updateEmail({
  user,
  newEmail,
}: {
  user: UserStructureAuthenticated;
  newEmail: string;
}): Promise<void> {
  if (newEmail.toLowerCase() === user.email.toLowerCase()) {
    throw new BadRequestException("SAME_EMAIL");
  }

  const existing = await userStructureRepository.findOneBy({
    email: newEmail,
    status: Not("DELETE"),
  });
  if (existing) {
    throw new ConflictException("EMAIL_ALREADY_USED");
  }

  try {
    await userStructureRepository.update({ id: user.id }, { email: newEmail });
  } catch (err) {
    // Filet de sécurité si un utilisateur soft-deleted détient encore
    // l'email cible : le pré-check ci-dessus l'exclut via status != DELETE,
    // mais la contrainte unique en base ne fait pas cette distinction.
    if (
      err instanceof QueryFailedError &&
      (err as unknown as { code?: string }).code === "23505"
    ) {
      throw new ConflictException("EMAIL_ALREADY_USED");
    }
    throw err;
  }
}
