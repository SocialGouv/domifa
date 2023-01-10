import { usagerRepository, USAGER_PORTAIL_ATTRIBUTES } from "../../../database";
import { PortailUsagerProfile } from "../../../_common/model";

export const portailUsagerProfilBuilder = {
  build,
};

async function build({
  usagerUUID,
}: {
  usagerUUID: string;
}): Promise<PortailUsagerProfile> {
  const usager = await usagerRepository.findOneOrFail({
    where: {
      uuid: usagerUUID,
    },
    select: USAGER_PORTAIL_ATTRIBUTES,
  });

  const portailUsagerProfile: PortailUsagerProfile = {
    usager,
  };
  return portailUsagerProfile;
}
