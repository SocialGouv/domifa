import { Injectable, OnModuleInit } from "@nestjs/common";
import { SentryCron } from "@sentry/nestjs";
import {
  structureRepository,
  openDataPlaceRepository,
  openDataCitiesRepository,
  usagerRepository,
} from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data";
import {
  appLogger,
  cleanAddress,
  cleanCity,
  cleanSpaces,
} from "../../../../util";
import { getAddress } from "../../../structures/services/location.service";
import { OpenDataPlace } from "../../interfaces";
import { findNetwork } from "@domifa/common";
import { getDomiciliesSegment } from "../../functions";
import { Cron, CronExpression } from "@nestjs/schedule";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";

@Injectable()
export class LoadDomifaDataService implements OnModuleInit {
  async onModuleInit() {
    if (
      (domifaConfig().envId === "local" || domifaConfig().envId === "prod") &&
      isCronEnabled()
    ) {
      appLogger.info("LoadMssDataService: Running import on module init");
      await this.loadDomifaInOpenDataPlaces();
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    disabled: !isCronEnabled() || domifaConfig().envId !== "prod",
  })
  @SentryCron("open-data-load-domifa", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_1AM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 60,
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
          "siret",
          "createdAt",
          "updatedAt",
        ],
      });

      appLogger.info(`Processing ${places.length} structures...`);

      for await (const place of places) {
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
    // 1️⃣ Compter les domiciliés
    const nbDomiciliesDomifa = await usagerRepository.count({
      where: { statut: "VALIDE", structureId: place.id },
    });

    const domicilieSegment = getDomiciliesSegment(nbDomiciliesDomifa);

    // 2️⃣ Déterminer l'adresse à utiliser
    const adresse = place?.adresseCourrier?.actif
      ? cleanAddress(place?.adresseCourrier.adresse)
      : cleanAddress(place.adresse);
    const codePostal = place?.adresseCourrier?.actif
      ? place?.adresseCourrier.codePostal
      : place.codePostal;
    const ville = place?.adresseCourrier?.actif
      ? cleanCity(place?.adresseCourrier.ville)
      : cleanCity(place.ville);

    // 3️⃣ Géolocaliser seulement si nécessaire et récupérer le cityCode
    let latitude = place.latitude;
    let longitude = place.longitude;
    let cityCode = null;

    if (!latitude || !longitude) {
      const addressToSearch = `${adresse}, ${ville} ${codePostal}`;
      const addressResult = await getAddress(addressToSearch);

      if (addressResult) {
        latitude = addressResult.geometry.coordinates[1];
        longitude = addressResult.geometry.coordinates[0];
        cityCode = addressResult.properties?.citycode || null;
      }
    }

    // Récupérer le populationSegment depuis open_data_cities si cityCode disponible
    let populationSegment = null;
    if (cityCode) {
      const cityData = await openDataCitiesRepository.findOne({
        where: { cityCode },
        select: ["populationSegment"],
      });
      populationSegment = cityData?.populationSegment || null;
    }

    // 4️⃣ Chercher l'entrée DomiFa existante (source: "domifa" + domifaStructureId)
    const existingDomifaPlace = await openDataPlaceRepository.findOneBy({
      source: "domifa",
      domifaStructureId: place.id,
    });

    // 5️⃣ Construire les données DomiFa
    const placeData: Partial<OpenDataPlace> = {
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
      siret: place.siret || null,
      cityCode,
      populationSegment,
      mail: place.email,
      structureType: place.structureType,
      nbDomiciliesDomifa,
      reseau: place?.reseau ?? findNetwork(cleanSpaces(place.nom)),
      domicilieSegment,
    };

    // 6️⃣ UPDATE ou CREATE l'entrée DomiFa
    if (existingDomifaPlace) {
      // Conserver les IDs des autres sources (liens croisés)
      await openDataPlaceRepository.update(
        { uuid: existingDomifaPlace.uuid },
        {
          ...placeData,
          soliguideStructureId: existingDomifaPlace.soliguideStructureId,
          mssId: existingDomifaPlace.mssId,
          dgcsId: existingDomifaPlace.dgcsId,
          // Conserver le siret existant si pas de nouveau siret
          siret: placeData.siret || existingDomifaPlace.siret,
        }
      );
    } else {
      await openDataPlaceRepository.save(new OpenDataPlaceTable(placeData));
    }

    // 7️⃣ Chercher les places correspondantes (autres sources) pour créer les liens croisés et enrichir
    let nearbySoliguide = null;
    let nearbyMss = null;

    // D'abord chercher MSS par SIRET si disponible
    if (place.siret) {
      nearbyMss = await openDataPlaceRepository.findOneBy({
        source: "mss",
        siret: place.siret,
      });
    }

    // Si pas de match par SIRET ou pas de SIRET, chercher par géolocalisation
    if (latitude && longitude) {
      // Chercher Soliguide proche
      nearbySoliguide = await openDataPlaceRepository.findNearbyPlaces(
        latitude,
        longitude,
        { source: "soliguide", maxDistance: 50 }
      );

      // Chercher MSS proche seulement si pas déjà trouvé par SIRET
      if (!nearbyMss) {
        nearbyMss = await openDataPlaceRepository.findNearbyPlaces(
          latitude,
          longitude,
          { source: "mss", maxDistance: 50 }
        );
      }
    }

    const updates: Partial<OpenDataPlace> = {};

    // Lier avec Soliguide si trouvé + enrichissement bidirectionnel
    if (nearbySoliguide) {
      if (nearbySoliguide.soliguideStructureId) {
        updates.soliguideStructureId = nearbySoliguide.soliguideStructureId;
      }
      // Enrichir DomiFa avec les infos Soliguide (saturation)
      if (nearbySoliguide.saturation) {
        updates.saturation = nearbySoliguide.saturation;
      }
      if (nearbySoliguide.saturationDetails) {
        updates.saturationDetails = nearbySoliguide.saturationDetails;
      }
      // Enrichir DomiFa avec complementAdresse si manquant
      if (!placeData.complementAdresse && nearbySoliguide.complementAdresse) {
        updates.complementAdresse = nearbySoliguide.complementAdresse;
      }
      // Enrichir DomiFa avec mail si manquant
      if (!placeData.mail && nearbySoliguide.mail) {
        updates.mail = nearbySoliguide.mail;
      }

      // Enrichir Soliguide avec les infos DomiFa
      const soliguideUpdates: Partial<OpenDataPlace> = {
        domifaStructureId: place.id,
        nbDomiciliesDomifa,
        software: "domifa",
      };
      // Enrichir avec complementAdresse si manquant
      if (!nearbySoliguide.complementAdresse && placeData.complementAdresse) {
        soliguideUpdates.complementAdresse = placeData.complementAdresse;
      }
      // Enrichir avec mail si manquant
      if (!nearbySoliguide.mail && placeData.mail) {
        soliguideUpdates.mail = placeData.mail;
      }
      // Enrichir avec reseau (priorité DomiFa)
      if (placeData.reseau) {
        soliguideUpdates.reseau = placeData.reseau;
      }
      await openDataPlaceRepository.update(
        { uuid: nearbySoliguide.uuid },
        soliguideUpdates
      );
    }

    // Lier avec MSS si trouvé + enrichir MSS avec les infos DomiFa
    if (nearbyMss?.mssId) {
      updates.mssId = nearbyMss.mssId;

      const mssUpdates: Partial<OpenDataPlace> = {
        domifaStructureId: place.id,
        nbDomiciliesDomifa,
        software: "domifa",
      };
      // Enrichir avec complementAdresse si manquant
      if (!nearbyMss.complementAdresse && placeData.complementAdresse) {
        mssUpdates.complementAdresse = placeData.complementAdresse;
      }
      // Enrichir avec mail si manquant
      if (!nearbyMss.mail && placeData.mail) {
        mssUpdates.mail = placeData.mail;
      }
      // Enrichir avec siret si manquant
      if (!nearbyMss.siret && placeData.siret) {
        mssUpdates.siret = placeData.siret;
      }
      // Enrichir avec reseau (priorité DomiFa)
      if (placeData.reseau) {
        mssUpdates.reseau = placeData.reseau;
      }

      await openDataPlaceRepository.update(
        { uuid: nearbyMss.uuid },
        mssUpdates
      );
    }

    // Mettre à jour notre entrée DomiFa avec les IDs trouvés et enrichissements
    if (Object.keys(updates).length > 0) {
      await openDataPlaceRepository.update(
        { source: "domifa", domifaStructureId: place.id },
        updates
      );
    }
  }
}
