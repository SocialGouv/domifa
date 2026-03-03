import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import {
  findNetwork,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import axios from "axios";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import {
  openDataPlaceRepository,
  openDataCitiesRepository,
} from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data";
import { getAddress } from "../../../structures/services/location.service";
import {
  appLogger,
  cleanAddress,
  cleanCity,
  cleanSpaces,
  padPostalCode,
} from "../../../../util";
import { mapMssTypeToStructureType } from "../../functions";
import { MssPlace, OpenDataPlace } from "../../interfaces";

@Injectable()
export class LoadMssDataService implements OnModuleInit {
  async onModuleInit() {
    if (
      (domifaConfig().envId === "local" || domifaConfig().envId === "prod") &&
      isCronEnabled()
    ) {
      appLogger.info("LoadMssDataService: Running import on module init");
      await this.importMssData();
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled() || domifaConfig().envId !== "prod",
  })
  @SentryCron("open-data-load-mss", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_MIDNIGHT,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 60,
  })
  async importMssData(): Promise<void> {
    if (
      !domifaConfig().openDataApps.mssUrl ||
      !domifaConfig().openDataApps.mssToken
    ) {
      appLogger.info("[IMPORT DATA MSS] Fail, token or url is not in env");
      return;
    }

    appLogger.info("Import MSS start 🏃‍♂️...");

    try {
      await this.getFromMss();
    } catch (error) {
      appLogger.error("Fatal error during MSS import", error);
      throw error;
    }
  }

  private async getFromMss(): Promise<void> {
    let newPlaces = 0;
    let updatedPlaces = 0;

    const response = await axios.get<MssPlace[]>(
      domifaConfig().openDataApps.mssUrl,
      {
        headers: {
          Authorization: `Bearer ${domifaConfig().openDataApps.mssToken}`,
        },
      }
    );

    appLogger.info(`${response.data.length} places to import...`);

    for await (const place of response.data) {
      if (!place?.name) {
        continue;
      }
      console.log(place);

      const postalCode = padPostalCode(place.zipcode.replace(/\W/g, ""));
      const address = `${place.address}, ${place?.city} ${postalCode}`;
      const addressResult = await getAddress(address);

      if (!addressResult) {
        appLogger.warn(`Address not found ${address}`);
        continue;
      }

      const position = addressResult.geometry;
      const cityCode = addressResult.properties?.citycode || null;

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
      const latitude = position.coordinates[1];
      const longitude = position.coordinates[0];

      // Récupérer le populationSegment depuis open_data_cities si cityCode disponible
      let populationSegment = null;
      if (cityCode) {
        const cityData = await openDataCitiesRepository.findOne({
          where: { cityCode },
          select: ["populationSegment"],
        });
        populationSegment = cityData?.populationSegment || null;
      }

      // 1️⃣ Chercher l'entrée MSS existante (source: "mss" + mssId)
      const existingMssPlace = await openDataPlaceRepository.findOneBy({
        source: "mss",
        mssId,
      });

      // 2️⃣ Construire les données MSS
      const mssData: Partial<OpenDataPlace> = {
        nom: cleanSpaces(place.name),
        adresse: cleanAddress(place?.address),
        codePostal: postalCode,
        ville: cleanCity(place?.city),
        departement,
        structureType: mapMssTypeToStructureType(place.type),
        region: getRegionCodeFromDepartement(departement),
        latitude,
        longitude,
        source: "mss",
        mail: null,
        mssId,
        siret: place.siret || null,
        cityCode,
        populationSegment,
        reseau: findNetwork(cleanSpaces(place.name)),
        software: "other",
      };

      // 3️⃣ UPDATE ou CREATE l'entrée MSS
      if (existingMssPlace) {
        // Conserver les IDs des autres sources (liens croisés)
        await openDataPlaceRepository.update(
          { uuid: existingMssPlace.uuid },
          {
            ...mssData,
            domifaStructureId: existingMssPlace.domifaStructureId,
            soliguideStructureId: existingMssPlace.soliguideStructureId,
            dgcsId: existingMssPlace.dgcsId,
            // Conserver le siret existant si pas de nouveau siret
            siret: mssData.siret || existingMssPlace.siret,
          }
        );
        updatedPlaces++;
      } else {
        await openDataPlaceRepository.save(new OpenDataPlaceTable(mssData));
        newPlaces++;
      }

      // 4️⃣ Chercher les places correspondantes (autres sources) pour créer les liens croisés et enrichir
      let nearbyDomifa = null;
      let nearbySoliguide = null;

      // D'abord chercher par SIRET si disponible
      if (place.siret) {
        nearbyDomifa = await openDataPlaceRepository.findOneBy({
          source: "domifa",
          siret: place.siret,
        });
      }

      // Si pas de match par SIRET, chercher par géolocalisation
      if (!nearbyDomifa && latitude && longitude) {
        // Chercher DomiFa proche
        nearbyDomifa = await openDataPlaceRepository.findNearbyPlaces(
          latitude,
          longitude,
          { source: "domifa", maxDistance: 50 }
        );

        // Chercher Soliguide proche
        nearbySoliguide = await openDataPlaceRepository.findNearbyPlaces(
          latitude,
          longitude,
          { source: "soliguide", maxDistance: 50 }
        );
      }

      const updates: Partial<OpenDataPlace> = {};

      // Lier avec DomiFa si trouvé + enrichir MSS avec les infos DomiFa
      if (nearbyDomifa) {
        if (nearbyDomifa.domifaStructureId) {
          updates.domifaStructureId = nearbyDomifa.domifaStructureId;
        }
        if (nearbyDomifa.nbDomiciliesDomifa) {
          updates.nbDomiciliesDomifa = nearbyDomifa.nbDomiciliesDomifa;
          updates.software = "domifa";
        }
        // Enrichir avec domicilieSegment
        if (nearbyDomifa.domicilieSegment) {
          updates.domicilieSegment = nearbyDomifa.domicilieSegment;
        }
        // Enrichir avec saturation si disponible
        if (nearbyDomifa.saturation) {
          updates.saturation = nearbyDomifa.saturation;
        }
        if (nearbyDomifa.saturationDetails) {
          updates.saturationDetails = nearbyDomifa.saturationDetails;
        }
        // Enrichir MSS avec complementAdresse si manquant
        if (!mssData.complementAdresse && nearbyDomifa.complementAdresse) {
          updates.complementAdresse = nearbyDomifa.complementAdresse;
        }
        // Enrichir MSS avec mail si manquant
        if (!mssData.mail && nearbyDomifa.mail) {
          updates.mail = nearbyDomifa.mail;
        }
        // Enrichir MSS avec reseau (priorité DomiFa)
        if (nearbyDomifa.reseau) {
          updates.reseau = nearbyDomifa.reseau;
        }
        // Enrichir MSS avec cityCode si manquant
        if (!mssData.cityCode && nearbyDomifa.cityCode) {
          updates.cityCode = nearbyDomifa.cityCode;
        }
        // Enrichir MSS avec populationSegment si manquant
        if (!mssData.populationSegment && nearbyDomifa.populationSegment) {
          updates.populationSegment = nearbyDomifa.populationSegment;
        }

        // Enrichir DomiFa avec complementAdresse et siret MSS si manquants
        const domifaUpdates: Partial<OpenDataPlace> = { mssId };
        if (!nearbyDomifa.complementAdresse && mssData.complementAdresse) {
          domifaUpdates.complementAdresse = mssData.complementAdresse;
        }
        if (!nearbyDomifa.siret && mssData.siret) {
          domifaUpdates.siret = mssData.siret;
        }
        // Enrichir DomiFa avec cityCode si manquant
        if (!nearbyDomifa.cityCode && mssData.cityCode) {
          domifaUpdates.cityCode = mssData.cityCode;
        }
        // Enrichir DomiFa avec populationSegment si manquant
        if (!nearbyDomifa.populationSegment && mssData.populationSegment) {
          domifaUpdates.populationSegment = mssData.populationSegment;
        }

        await openDataPlaceRepository.update(
          { uuid: nearbyDomifa.uuid },
          domifaUpdates
        );
      }

      // Lier avec Soliguide si trouvé + enrichir MSS avec saturation
      if (nearbySoliguide) {
        if (nearbySoliguide.soliguideStructureId) {
          updates.soliguideStructureId = nearbySoliguide.soliguideStructureId;
        }
        // Enrichir MSS avec saturation de Soliguide
        if (nearbySoliguide.saturation) {
          updates.saturation = nearbySoliguide.saturation;
        }
        if (nearbySoliguide.saturationDetails) {
          updates.saturationDetails = nearbySoliguide.saturationDetails;
        }
        // Enrichir MSS avec complementAdresse si manquant
        if (!mssData.complementAdresse && nearbySoliguide.complementAdresse) {
          updates.complementAdresse = nearbySoliguide.complementAdresse;
        }
        // Enrichir MSS avec mail si manquant
        if (!mssData.mail && nearbySoliguide.mail) {
          updates.mail = nearbySoliguide.mail;
        }

        // Enrichir Soliguide avec complementAdresse et siret MSS si manquants
        const soliguideUpdates: Partial<OpenDataPlace> = { mssId };
        if (!nearbySoliguide.complementAdresse && mssData.complementAdresse) {
          soliguideUpdates.complementAdresse = mssData.complementAdresse;
        }
        if (!nearbySoliguide.siret && mssData.siret) {
          soliguideUpdates.siret = mssData.siret;
        }

        await openDataPlaceRepository.update(
          { uuid: nearbySoliguide.uuid },
          soliguideUpdates
        );
      }

      // Mettre à jour notre entrée MSS avec les IDs trouvés et enrichissements
      if (Object.keys(updates).length > 0) {
        await openDataPlaceRepository.update({ source: "mss", mssId }, updates);
      }
    }

    appLogger.info("✅ Import 'Mon suivi social' data done");
    appLogger.info(`🆕 ${newPlaces}/${response.data.length} places added`);
    appLogger.info(
      `🔁 ${updatedPlaces}/${response.data.length} places updated`
    );
  }
}
