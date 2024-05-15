import { userStructureRepository } from "../../../database";
import { PortailAdminProfile, PortailAdminUser } from "../../../_common/model";
import { USER_ADMIN_WHERE } from "../../../database/services/user-admin/userAdminRepository.service";

export const portailAdminProfilBuilder = {
  build,
};

async function build({
  userId,
}: {
  userId: number;
}): Promise<PortailAdminProfile> {
  const userAdmin = await userStructureRepository.findOneOrFail({
    where: {
      id: userId,
      ...USER_ADMIN_WHERE,
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
    ],
  });

  const user: PortailAdminUser = {
    id: userAdmin.id,
    nom: userAdmin.nom,
    prenom: userAdmin.prenom,
    email: userAdmin.email,
    password: userAdmin.password,
    verified: userAdmin.verified,
    lastLogin: userAdmin.lastLogin,
    userRightStatus: "super-admin-domifa",
    territories: userAdmin?.territories,
  };

  const portailAdminProfile: PortailAdminProfile = {
    user,
  };
  return portailAdminProfile;
}
