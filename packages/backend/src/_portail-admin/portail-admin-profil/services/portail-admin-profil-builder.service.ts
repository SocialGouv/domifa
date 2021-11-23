import { userAdminRepository } from "../../../database/services/user-admin/userAdminRepository.service";
import { PortailAdminProfile, PortailAdminUser } from "../../../_common/model";

export const portailAdminProfilBuilder = {
  build,
};

async function build({
  userId,
}: {
  userId: number;
}): Promise<PortailAdminProfile> {
  const userAdmin = await userAdminRepository.findOne({
    id: userId,
  });

  const user: PortailAdminUser = {
    uuid: userAdmin.uuid,
    id: userAdmin.id,
    nom: userAdmin.nom,
    prenom: userAdmin.prenom,
    email: userAdmin.email,
    password: userAdmin.password,
    verified: userAdmin.verified,
    lastLogin: userAdmin.lastLogin,
  };

  const portailAdminProfile: PortailAdminProfile = {
    user,
  };
  return portailAdminProfile;
}
