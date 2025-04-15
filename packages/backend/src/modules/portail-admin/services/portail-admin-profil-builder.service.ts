import { PortailAdminUser } from "@domifa/common";
import { userSupervisorRepository } from "../../../database";

export const portailAdminProfilBuilder = {
  build,
};

async function build({
  userId,
}: {
  userId: number;
}): Promise<PortailAdminUser> {
  return await userSupervisorRepository.findOneOrFail({
    where: {
      id: userId,
    },
    select: [
      "uuid",
      "createdAt",
      "updatedAt",
      "version",
      "id",
      "prenom",
      "nom",
      "email",
      "role",
      "territories",
    ],
  });
}
