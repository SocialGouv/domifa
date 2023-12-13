import { OpenDataPlaceTable } from "../database/entities/open-data-place";

import { openDataPlaceRepository } from "../database/services/place/open-data-place-repository";
import { structureRepository } from "../database";

import { IsNull, Not } from "typeorm";
import { appLogger, cleanAddress, cleanCity } from "../util";

export const loadDomifaData = async () => {
  appLogger.info("Import DomiFa start 🏃‍♂️... ");

  try {
    const places = await structureRepository.find({
      where: {
        latitude: Not(IsNull()),
        longitude: Not(IsNull()),
      },
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
      let domifaPlace = await openDataPlaceRepository.findOneBy({
        source: "domifa",
        uniqueId: place.id.toString(),
      });

      if (!domifaPlace) {
        domifaPlace = await openDataPlaceRepository.save(
          new OpenDataPlaceTable({
            nom: place.nom.trim(),
            adresse: cleanAddress(place.adresse),
            codePostal: place.codePostal,
            ville: cleanCity(place.ville),
            departement: place.departement,
            region: place.region,
            software: "domifa",
            latitude: place.latitude,
            longitude: place.longitude,
            source: "domifa",
            domifaStructureId: place.id,
            soliguideStructureId: null,
            mail: place.email,
            structureType: place.structureType,
            uniqueId: place.id.toString(),
          })
        );
      }
    }
    appLogger.info("Import domifa complete ✅");
  } catch (e) {
    console.log(e);
    console.error("[IMPORT] Something happen");
  }
};
