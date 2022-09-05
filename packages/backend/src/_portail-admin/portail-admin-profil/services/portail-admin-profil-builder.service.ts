import { USER_ADMIN_WHERE } from "./../../../database/services/user-admin/UserAdminRepository.service";
import {
  UserAdminRepository,
  USER_ADMIN_PROFILE_ATTRIBUTES,
} from "../../../database";
import { PortailAdminProfile, PortailAdminUser } from "../../../_common/model";

export const portailAdminProfilBuilder = {
  build,
};

async function build({
  userId,
}: {
  userId: number;
}): Promise<PortailAdminProfile> {
  const userAdmin = await UserAdminRepository.findOneOrFail({
    where: {
      id: userId,
      ...USER_ADMIN_WHERE,
    },
    select: USER_ADMIN_PROFILE_ATTRIBUTES,
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
