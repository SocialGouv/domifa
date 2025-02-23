import {
  structureRepository,
  openDataPlaceRepository,
  usagerRepository,
} from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data-place";
import {
  appLogger,
  cleanAddress,
  cleanCity,
  cleanSpaces,
} from "../../../../util";
import { getLocation } from "../../../../structures/services/location.service";
import { Point } from "geojson";
import { OpenDataPlace } from "../../interfaces";

export const loadDomifaData = async () => {
  appLogger.info("Import DomiFa start 🏃‍♂️... ");

  try {
    const places = await structureRepository.find({
      select: [
        "nom",
        "adresse",
        "codePostal",
        "ville",
        "departement",
        "region",
        "latitude",
        "longitude",
        "email",
        "structureType",
        "id",
      ],
    });

    for await (const place of places) {
      const domifaPlace = await openDataPlaceRepository.findOneBy({
        source: "domifa",
        uniqueId: place.id.toString(),
      });

      const nbDomiciliesDomifa = await usagerRepository.count({
        where: { statut: "VALIDE", structureId: place.id },
      });

      const placeData: OpenDataPlace = {
        nom: cleanSpaces(place.nom),
        adresse: cleanAddress(place.adresse),
        codePostal: place.codePostal,
        ville: cleanCity(place.ville),
        departement: place.departement,
        region: place.region,
        complementAdresse: cleanSpaces(place.complementAdresse),
        software: "domifa",
        latitude: place.latitude,
        longitude: place.longitude,
        source: "domifa",
        domifaStructureId: place.id,
        mail: place.email,
        structureType: place.structureType,
        uniqueId: place.id.toString(),
        nbDomiciliesDomifa,
      };

      if (!place?.latitude || !place?.longitude) {
        const position: Point | null = await getLocation(
          `${placeData.adresse}, ${placeData.ville} ${placeData.codePostal}`
        );

        placeData.latitude = position.coordinates[1];
        placeData.longitude = position.coordinates[0];
      }

      if (!domifaPlace) {
        await openDataPlaceRepository.save(new OpenDataPlaceTable(placeData));
      } else {
        await openDataPlaceRepository.update(
          { uuid: domifaPlace.uuid },
          {
            ...placeData,
            soliguideStructureId: domifaPlace.soliguideStructureId,
            mssId: domifaPlace.mssId,
          }
        );
      }
    }
    appLogger.info("Import domifa complete ✅");
  } catch (e) {
    console.error("[IMPORT] Something happen", e);
  }
};
