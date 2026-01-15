import { Injectable } from "@nestjs/common";
import {
  structureRepository,
  openDataPlaceRepository,
  usagerRepository,
} from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data";
import {
  appLogger,
  cleanAddress,
  cleanCity,
  cleanSpaces,
} from "../../../../util";
import { getLocation } from "../../../structures/services/location.service";
import { OpenDataPlace } from "../../interfaces";
import { findNetwork } from "@domifa/common";
import { getDomiciliesSegment } from "../../functions";
import { Cron, CronExpression } from "@nestjs/schedule";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";

@Injectable()
export class LoadDomifaDataService {
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    disabled: !isCronEnabled() || domifaConfig().envId !== "prod",
  })
  async loadDomifaInOpenDataPlaces(): Promise<void> {
    appLogger.info("Import DomiFa start 🏃‍♂️...");

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
          "complementAdresse",
          "id",
          "createdAt",
          "updatedAt",
        ],
      });

      appLogger.info(`Processing ${places.length} structures...`);

      for (const place of places) {
        try {
          await this.processPlace(place);
        } catch (error) {
          appLogger.warn(`Error processing structure ${place.id}`, error);
        }
      }

      appLogger.info("Import domifa complete ✅");
    } catch (error) {
      appLogger.error("Fatal error during DomiFa import", error);
      throw error;
    }
  }

  private async processPlace(place: any): Promise<void> {
    // 1️⃣ Checker si la place Domifa existe
    const existingDomifaPlace = await openDataPlaceRepository.findOneBy({
      source: "domifa",
      domifaStructureId: place.id,
    });

    // 2️⃣ Compter les domiciliés
    const nbDomiciliesDomifa = await usagerRepository.count({
      where: { statut: "VALIDE", structureId: place.id },
    });

    const domicilieSegment = getDomiciliesSegment(nbDomiciliesDomifa);

    // 3️⃣ Déterminer l'adresse à utiliser
    const adresse = place?.adresseCourrier?.actif
      ? cleanAddress(place?.adresseCourrier.adresse)
      : cleanAddress(place.adresse);
    const codePostal = place?.adresseCourrier?.actif
      ? place?.adresseCourrier.codePostal
      : place.codePostal;
    const ville = place?.adresseCourrier?.actif
      ? cleanCity(place?.adresseCourrier.ville)
      : cleanCity(place.ville);

    // 4️⃣ Géolocaliser seulement si nécessaire
    let latitude = place.latitude;
    let longitude = place.longitude;

    if (!latitude || !longitude) {
      const addressToSearch = `${adresse}, ${ville} ${codePostal}`;
      const position = await getLocation(addressToSearch);

      if (position) {
        latitude = position.coordinates[1];
        longitude = position.coordinates[0];
      }
    }

    // 5️⃣ Construire les données
    const placeData: Partial<OpenDataPlace> = {
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
      nom: cleanSpaces(place.nom),
      adresse,
      codePostal,
      ville,
      departement: place.departement,
      region: place.region,
      complementAdresse: cleanSpaces(place.complementAdresse), // ✅ Direct depuis place
      software: "domifa",
      latitude,
      longitude,
      source: "domifa",
      domifaStructureId: place.id,
      mail: place.email,
      structureType: place.structureType,
      nbDomiciliesDomifa,
      reseau: place?.reseau ?? findNetwork(cleanSpaces(place.nom)),
      domicilieSegment,
    };

    // 6️⃣ UPDATE ou CREATE
    if (existingDomifaPlace) {
      await openDataPlaceRepository.update(
        { uuid: existingDomifaPlace.uuid },
        {
          ...placeData,
          soliguideStructureId: existingDomifaPlace.soliguideStructureId,
          mssId: existingDomifaPlace.mssId,
          dgcsId: existingDomifaPlace.dgcsId,
        }
      );
    } else {
      await openDataPlaceRepository.save(new OpenDataPlaceTable(placeData));
    }

    // 7️⃣ UPDATE la structure
    await structureRepository.update({ id: place.id }, { domicilieSegment });
  }
}
