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

  const portailUsagerPublic: PortailUsagerPublic = {
    uuid: usager.uuid,
    structureId: usager.structureId,
    prenom: usager.prenom,
    nom: usager.nom,
    // TODO à compléter, puis virer le "as any"
  } as any;

  const portailUsagerProfile: PortailUsagerProfile = {
    usager: portailUsagerPublic,
  };
  return portailUsagerProfile;
}
