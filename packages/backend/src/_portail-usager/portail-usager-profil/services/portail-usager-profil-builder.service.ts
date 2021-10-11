import { usagerPortailRepository } from "../../../database";
import {
  PortailUsagerProfile,
  PortailUsagerPublic,
} from "../../../_common/model";

export const portailUsagerProfilBuilder = {
  build,
};

async function build({
  usagerUUID,
}: {
  usagerUUID: string;
}): Promise<PortailUsagerProfile> {
  const usager = await usagerPortailRepository.findOne({
    uuid: usagerUUID,
  });

  const portailUsagerProfile: PortailUsagerProfile = {
    usager,
  };
  return portailUsagerProfile;
}
