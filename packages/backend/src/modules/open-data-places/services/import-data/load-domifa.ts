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
import { getLocation } from "../../../structures/services/location.service";
import { Point } from "geojson";
import { OpenDataPlace } from "../../interfaces";
import { findNetwork } from "@domifa/common";

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
        "reseau",
        "email",
        "structureType",
        "adresseCourrier",
        "id",
      ],
    });

    for await (const place of places) {
      const domifaPlace = await openDataPlaceRepository.findOneBy({
        source: "domifa",
        domifaStructureId: place.id,
      });

      const nbDomiciliesDomifa = await usagerRepository.count({
        where: { statut: "VALIDE", structureId: place.id },
      });

      const adresse = place?.adresseCourrier?.actif
        ? cleanAddress(place?.adresseCourrier.adresse)
        : cleanAddress(place.adresse);
      const codePostal = place?.adresseCourrier?.actif
        ? place?.adresseCourrier.codePostal
        : place.codePostal;
      const ville = place?.adresseCourrier?.actif
        ? cleanCity(place?.adresseCourrier.ville)
        : cleanCity(place.ville);

      const addressToSearch = `${adresse}, ${ville} ${codePostal}`;
      const position = await getLocation(addressToSearch);

      let latitude = null;
      let longitude = null;

      if (!position) {
        latitude = place.latitude;
        longitude = place.longitude;
      } else {
        latitude = position.coordinates[1];
        longitude = position.coordinates[0];
      }

      const placeData: OpenDataPlace = {
        createdAt: place.createdAt,
        updatedAt: place.updatedAt,
        nom: cleanSpaces(place.nom),
        adresse,
        codePostal,
        ville,
        departement: place.departement,
        region: place.region,
        complementAdresse: cleanSpaces(place.complementAdresse),
        software: "domifa",
        latitude,
        longitude,
        source: "domifa",
        domifaStructureId: place.id,
        mail: place.email,
        structureType: place.structureType,
        nbDomiciliesDomifa,
        reseau: place?.reseau ?? findNetwork(cleanSpaces(place.nom)),
      };

      if (!place?.latitude || !place?.longitude) {
        const position: Point | null = await getLocation(
          `${adresse}, ${ville} ${codePostal}`
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
            dgcsId: domifaPlace.dgcsId,
          }
        );
      }

      await openDataPlaceRepository.update(
        { domifaStructureId: place.id },
        {
          nbDomiciliesDomifa,
          reseau: placeData.reseau,
        }
      );
    }

    appLogger.info("Import domifa complete ✅");
  } catch (e) {
    console.error("[IMPORT] Something happen", e);
  }
};
