import {
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import axios from "axios";
import { domifaConfig } from "../../../../config";
import { openDataPlaceRepository } from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data-place";
import { getLocation } from "../../../../structures/services/location.service";
import { appLogger, cleanAddress, cleanCity } from "../../../../util";
import { getStructureType } from "../../functions";
import { MssPlace, OpenDataPlace } from "../../interfaces";

const getFromMss = async () => {
  let newPlaces = 0;
  let updatedPlaces = 0;
  try {
    const response = await axios.get<MssPlace[]>(
      domifaConfig().openDataApps.mssUrl,
      {
        headers: {
          Authorization: `Bearer ${domifaConfig().openDataApps.mssToken}`,
        },
      }
    );

    appLogger.info(`${response.data.length} places to import... `);

    for await (const place of response.data) {
      if (!place.name) {
        continue;
      }

      const postalCode = place.zipcode.replace(/\W/g, "");
      const address = `${place.address}, ${place?.city} ${postalCode}`;
      const position = await getLocation(address);

      if (!position) {
        appLogger.warn(`Address not found ${address}`);
        continue;
      }

      try {
        const departement = getDepartementFromCodePostal(postalCode);
        getRegionCodeFromDepartement(departement);
      } catch (err) {
        appLogger.warn(
          `[LoadMss] error validating postal code "${postalCode}"`
        );
        continue;
      }

      const mssId = place.id.toString();

      const departement = getDepartementFromCodePostal(postalCode);

      const openDataPlace: Partial<OpenDataPlace> = {
        nom: place.name,
        adresse: cleanAddress(place?.address),
        codePostal: postalCode,
        ville: cleanCity(place?.city),
        departement,
        structureType: getStructureType(place.name),
        region: getRegionCodeFromDepartement(departement),
        latitude: position.coordinates[1],
        longitude: position.coordinates[0],
        source: "mss",
        mail: null,
        uniqueId: mssId,
        mssId,
      };

      let mssPlace = await openDataPlaceRepository.findOneBy({
        source: "mss",
        uniqueId: mssId,
      });

      const placeExist: OpenDataPlace =
        await openDataPlaceRepository.findExistingPlace(
          openDataPlace.latitude,
          openDataPlace.longitude
        );

      if (placeExist) {
        openDataPlace.domifaStructureId = placeExist.domifaStructureId;
        openDataPlace.software = "domifa";

        await openDataPlaceRepository.update(
          { domifaStructureId: placeExist.domifaStructureId, source: "domifa" },
          { mssId: openDataPlace.mssId }
        );
      }

      if (!mssPlace) {
        newPlaces++;
        mssPlace = await openDataPlaceRepository.save(
          new OpenDataPlaceTable({
            ...openDataPlace,
          })
        );
      } else {
        updatedPlaces++;
        await openDataPlaceRepository.update(
          { uuid: mssPlace.uuid },
          { ...openDataPlace }
        );
      }
    }

    appLogger.info("✅ Import 'Mon suivi social' data done");
    appLogger.info(`🆕 ${newPlaces}/${response.data.length} places added`);
    appLogger.info(
      `🔁 ${updatedPlaces}/${response.data.length} places updated `
    );
  } catch (e) {
    console.log(e);
    appLogger.error(
      "[IMPORT] Something happen during 'Mon suivi social' import",
      e
    );
  }
};

export const loadMssData = async () => {
  if (
    !domifaConfig().openDataApps.mssUrl ||
    !domifaConfig().openDataApps.mssToken
  ) {
    appLogger.info("[IMPORT DATA MSS] Fail, token or url is not in env");
    return;
  }
  appLogger.info("Import MSS start 🏃‍♂️... ");
  await getFromMss();
};
