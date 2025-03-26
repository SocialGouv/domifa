import {
  findNetwork,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { getStructureType } from "../../functions";
import axios from "axios";
import { domifaConfig } from "../../../../config";
import { openDataPlaceRepository } from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data-place";
import {
  cleanAddress,
  cleanCity,
  appLogger,
  cleanSpaces,
} from "../../../../util";
import {
  DataInclusionPlace,
  DataInclusionResults,
  OpenDataPlace,
} from "../../interfaces";

let page = 1;
let nbResults = 0;

const getFromDataInclusion = async (structureType: "CCAS" | "CIAS") => {
  let datInclusionData: DataInclusionPlace[] = [];

  const url = `${
    domifaConfig().openDataApps.dataInclusionUrl
  }?typologie=${structureType}&page=${page}&size=500`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${
          domifaConfig().openDataApps.dataInclusionToken
        }`,
      },
    });

    const data: DataInclusionResults = response.data;
    datInclusionData = data.items;
    nbResults = data.total;

    for await (const place of datInclusionData) {
      if (
        place?.code_postal &&
        place?.latitude &&
        place?.longitude &&
        place?.commune
      ) {
        let dataInclusionPlace: OpenDataPlace = await openDataPlaceRepository
          .createQueryBuilder("open_data_places")
          .where(
            `("dataInclusionId" = :id and source='data-inclusion') OR (source='data-inclusion' and adresse = :adresse and ville = :ville)`,
            {
              adresse: cleanAddress(place?.adresse),
              ville: cleanCity(place?.commune),
              id: place.id,
            }
          )
          .getOne();

        if (!dataInclusionPlace) {
          const departement = getDepartementFromCodePostal(place.code_postal);

          dataInclusionPlace = await openDataPlaceRepository.save(
            new OpenDataPlaceTable({
              nom: place.nom.trim(),
              adresse: cleanAddress(place?.adresse),
              codePostal: place.code_postal,
              ville: cleanCity(place?.commune),
              departement,
              region: getRegionCodeFromDepartement(departement),
              software: "other",
              structureType: getStructureType(place.nom),
              latitude: place?.latitude,
              longitude: place?.longitude,
              source: "data-inclusion",
              reseau: findNetwork(cleanSpaces(place.nom)),
            })
          );
        }

        const domifaPlaceExist: OpenDataPlace =
          await openDataPlaceRepository.findNearbyPlaces(
            dataInclusionPlace?.latitude,
            dataInclusionPlace?.longitude,
            {
              source: "domifa",
              maxDistance: 300,
            }
          );

        if (domifaPlaceExist) {
          await openDataPlaceRepository.update(
            { uuid: dataInclusionPlace.uuid },
            { domifaStructureId: domifaPlaceExist.domifaStructureId }
          );
        }
      }
    }

    if (datInclusionData?.length >= 500) {
      appLogger.warn(
        `Import 'data-inclusion' data N°${page} : $
          datInclusionData.length * page
        }/${nbResults}`
      );
      page++;
      await getFromDataInclusion(structureType);
    } else {
      appLogger.info("Import of data-inclusion done ✅");
    }
  } catch (e) {
    appLogger.error("[IMPORT] Something happen", e);
  }
};
export const loadDataInclusionData = async (structureType: "CCAS" | "CIAS") => {
  if (
    !domifaConfig().openDataApps.dataInclusionUrl ||
    !domifaConfig().openDataApps.dataInclusionToken
  ) {
    console.log("[IMPORT DATA INCLUSION] Fail, token or url is not in env");
    return;
  }
  appLogger.info("Import data-inclusion start 🏃‍♂️... ");

  await getFromDataInclusion(structureType);
};
