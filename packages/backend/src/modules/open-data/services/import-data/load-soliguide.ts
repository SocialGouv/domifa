import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { domifaConfig } from "../../../../config";
import {
  findNetwork,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { getStructureType } from "../../functions";
import axios from "axios";
import {
  openDataPlaceRepository,
  openDataCitiesRepository,
} from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data";
import { cleanCity, cleanSpaces, appLogger } from "../../../../util";
import { getCityCode } from "../../../structures/services/location.service";
import { SoliguidePlace } from "../../interfaces";
import { OpenDataPlace } from "../../interfaces/OpenDataPlace.interface";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";

const RESULTS_BY_PAGE = 50;
const MAX_DISTANCE = 50; // 50 mètres pour détecter les doublons

@Injectable()
export class LoadSoliguideDataService implements OnModuleInit {
  async onModuleInit() {
    if (
      (domifaConfig().envId === "local" || domifaConfig().envId === "prod") &&
      isCronEnabled()
    ) {
      appLogger.info("LoadSoliguideDataService: Running import on module init");
      await this.importSoliguideData();
    }
  }

  private page = 1;
  private nbResults = 0;
  private newPlaces = 0;
  private updatedPlaces = 0;
  private readonly departementCache = new Map<string, string>();

  @Cron(CronExpression.EVERY_DAY_AT_NOON, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled() || domifaConfig().envId !== "prod",
  })
  @SentryCron("open-data-load-soliguide", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_NOON,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 60,
  })
  async importSoliguideData(): Promise<void> {
    appLogger.info("Import Soliguide start 🏃‍♂️...");

    // Reset state
    this.page = 1;
    this.nbResults = 0;
    this.newPlaces = 0;
    this.updatedPlaces = 0;
    this.departementCache.clear();

    try {
      if (!this.validateConfig()) {
        return;
      }

      await this.importPages();

      appLogger.info("✅ Import 'soliguide' data done");
      appLogger.info(`🆕 ${this.newPlaces} places added`);
      appLogger.info(`🔁 ${this.updatedPlaces} places updated`);
    } catch (error) {
      appLogger.error("Fatal error during Soliguide import", error);
      throw error;
    }
  }

  private validateConfig(): boolean {
    if (
      !domifaConfig().openDataApps.soliguideUrl ||
      !domifaConfig().openDataApps.soliguideToken
    ) {
      appLogger.error("[IMPORT DATA] Fail, token or url is not in env");
      return false;
    }
    return true;
  }

  private async importPages(): Promise<void> {
    const response = await this.fetchPage();

    if (!response) {
      return;
    }

    const soliguideData = response.data.places;
    this.nbResults = response.data.nbResults;

    appLogger.info(`${this.nbResults} places to import...`);

    await this.processPlaces(soliguideData);

    if (soliguideData.length === RESULTS_BY_PAGE) {
      appLogger.warn(
        `Import 'soliguide' data page N°${this.page}: ${
          soliguideData.length * this.page
        }/${this.nbResults}`
      );
      this.page++;
      await this.importPages();
    }
  }

  private async fetchPage() {
    try {
      return await axios.post(
        domifaConfig().openDataApps.soliguideUrl,
        {
          category: "domiciliation",
          placeType: "LIEU",
          location: {
            geoType: "pays",
            geoValue: "france",
          },
          options: {
            limit: RESULTS_BY_PAGE,
            page: this.page,
          },
        },
        {
          headers: {
            Authorization: `JWT ${domifaConfig().openDataApps.soliguideToken}`,
          },
        }
      );
    } catch (error) {
      appLogger.error(`Error fetching page ${this.page}`, error);
      return null;
    }
  }

  private async processPlaces(places: SoliguidePlace[]): Promise<void> {
    for await (const place of places) {
      try {
        await this.processPlace(place);
      } catch (error) {
        appLogger.warn(`Error processing place ${place.lieu_id}`, error);
      }
    }
  }

  private async processPlace(place: SoliguidePlace): Promise<void> {
    const departement = this.getDepartementCached(place.position.codePostal);

    const services = place.services_all.find(
      (service) => service.category === "domiciliation"
    );

    const service = services[0];

    if (!service) {
      return;
    }

    const latitude = place.position.location.coordinates[1];
    const longitude = place.position.location.coordinates[0];
    const soliguideStructureId = Number.parseInt(place.lieu_id as any, 10);

    // Récupérer le cityCode via l'API de géocodage
    const cityCode = await getCityCode({
      nom: place.name,
      ville: place.position.ville,
      codePostal: place.position.codePostal,
      latitude,
      longitude,
    });

    // Récupérer le populationSegment depuis open_data_cities si cityCode disponible
    let populationSegment = null;
    if (cityCode) {
      const cityData = await openDataCitiesRepository.findOne({
        where: { cityCode },
        select: ["populationSegment"],
      });
      populationSegment = cityData?.populationSegment || null;
    }

    // 1️⃣ Chercher l'entrée Soliguide existante (source: "soliguide" + soliguideStructureId)
    const existingSoliguidePlace = await openDataPlaceRepository.findOneBy({
      source: "soliguide",
      soliguideStructureId,
    });

    // 2️⃣ Construire les données Soliguide
    const soliguideData: Partial<OpenDataPlace> = {
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
      nom: cleanSpaces(place.name),
      adresse: place?.position?.adresse,
      codePostal: place.position.codePostal,
      ville: cleanCity(place?.position?.ville),
      departement,
      structureType: getStructureType(place.name),
      region: getRegionCodeFromDepartement(departement),
      latitude,
      longitude,
      source: "soliguide",
      mail: place?.entity?.mail?.toString() || null,
      soliguideStructureId,
      cityCode,
      populationSegment,
      software: "other",
      saturation: service?.saturated?.status,
      saturationDetails: service?.saturated?.precision,
      reseau: findNetwork(cleanSpaces(place.name)),
    };

    // 3️⃣ UPDATE ou CREATE l'entrée Soliguide
    if (existingSoliguidePlace) {
      // Conserver les IDs des autres sources (liens croisés)
      await openDataPlaceRepository.update(
        { uuid: existingSoliguidePlace.uuid },
        {
          ...soliguideData,
          domifaStructureId: existingSoliguidePlace.domifaStructureId,
          mssId: existingSoliguidePlace.mssId,
          dgcsId: existingSoliguidePlace.dgcsId,
          // Conserver cityCode et populationSegment existants si pas de nouvelles valeurs
          cityCode: soliguideData.cityCode || existingSoliguidePlace.cityCode,
          populationSegment:
            soliguideData.populationSegment ||
            existingSoliguidePlace.populationSegment,
        }
      );
      this.updatedPlaces++;
    } else {
      await openDataPlaceRepository.save(new OpenDataPlaceTable(soliguideData));
      this.newPlaces++;
    }

    // 4️⃣ Chercher les places proches (autres sources) pour créer les liens croisés et enrichir
    if (latitude && longitude) {
      // Chercher DomiFa proche
      const nearbyDomifa = await openDataPlaceRepository.findNearbyPlaces(
        latitude,
        longitude,
        { source: "domifa", maxDistance: MAX_DISTANCE }
      );

      // Chercher MSS proche
      const nearbyMss = await openDataPlaceRepository.findNearbyPlaces(
        latitude,
        longitude,
        { source: "mss", maxDistance: MAX_DISTANCE }
      );

      const updates: Partial<OpenDataPlace> = {};

      // Lier avec DomiFa si trouvé + enrichissement bidirectionnel
      if (nearbyDomifa) {
        if (nearbyDomifa.domifaStructureId) {
          updates.domifaStructureId = nearbyDomifa.domifaStructureId;
        }

        // Enrichir DomiFa avec les infos Soliguide
        const domifaUpdates: Partial<OpenDataPlace> = {
          soliguideStructureId,
        };
        if (soliguideData.saturation) {
          domifaUpdates.saturation = soliguideData.saturation;
        }
        if (soliguideData.saturationDetails) {
          domifaUpdates.saturationDetails = soliguideData.saturationDetails;
        }
        // Enrichir avec complementAdresse si manquant
        if (
          !nearbyDomifa.complementAdresse &&
          soliguideData.complementAdresse
        ) {
          domifaUpdates.complementAdresse = soliguideData.complementAdresse;
        }
        // Enrichir avec mail si manquant
        if (!nearbyDomifa.mail && soliguideData.mail) {
          domifaUpdates.mail = soliguideData.mail;
        }
        // Enrichir avec cityCode si manquant
        if (!nearbyDomifa.cityCode && soliguideData.cityCode) {
          domifaUpdates.cityCode = soliguideData.cityCode;
        }
        // Enrichir avec populationSegment si manquant
        if (
          !nearbyDomifa.populationSegment &&
          soliguideData.populationSegment
        ) {
          domifaUpdates.populationSegment = soliguideData.populationSegment;
        }
        await openDataPlaceRepository.update(
          { uuid: nearbyDomifa.uuid },
          domifaUpdates
        );

        // Enrichir Soliguide avec les infos DomiFa
        if (nearbyDomifa.nbDomiciliesDomifa) {
          updates.nbDomiciliesDomifa = nearbyDomifa.nbDomiciliesDomifa;
          updates.software = "domifa";
        }
        // Enrichir avec complementAdresse si manquant dans Soliguide
        if (
          !soliguideData.complementAdresse &&
          nearbyDomifa.complementAdresse
        ) {
          updates.complementAdresse = nearbyDomifa.complementAdresse;
        }
        // Enrichir avec mail si manquant dans Soliguide
        if (!soliguideData.mail && nearbyDomifa.mail) {
          updates.mail = nearbyDomifa.mail;
        }
        // Enrichir avec reseau (priorité DomiFa)
        if (nearbyDomifa.reseau) {
          updates.reseau = nearbyDomifa.reseau;
        }
        // Enrichir avec cityCode si manquant dans Soliguide
        if (!soliguideData.cityCode && nearbyDomifa.cityCode) {
          updates.cityCode = nearbyDomifa.cityCode;
        }
        // Enrichir avec populationSegment si manquant dans Soliguide
        if (
          !soliguideData.populationSegment &&
          nearbyDomifa.populationSegment
        ) {
          updates.populationSegment = nearbyDomifa.populationSegment;
        }
      }

      // Lier avec MSS si trouvé + enrichir MSS avec saturation
      if (nearbyMss?.mssId) {
        updates.mssId = nearbyMss.mssId;

        // Enrichir MSS avec les infos Soliguide
        const mssUpdates: Partial<OpenDataPlace> = {
          soliguideStructureId,
        };
        if (soliguideData.saturation) {
          mssUpdates.saturation = soliguideData.saturation;
        }
        if (soliguideData.saturationDetails) {
          mssUpdates.saturationDetails = soliguideData.saturationDetails;
        }
        // Enrichir avec complementAdresse si manquant
        if (!nearbyMss.complementAdresse && soliguideData.complementAdresse) {
          mssUpdates.complementAdresse = soliguideData.complementAdresse;
        }
        // Enrichir avec mail si manquant
        if (!nearbyMss.mail && soliguideData.mail) {
          mssUpdates.mail = soliguideData.mail;
        }
        // Enrichir avec cityCode si manquant
        if (!nearbyMss.cityCode && soliguideData.cityCode) {
          mssUpdates.cityCode = soliguideData.cityCode;
        }
        // Enrichir avec populationSegment si manquant
        if (!nearbyMss.populationSegment && soliguideData.populationSegment) {
          mssUpdates.populationSegment = soliguideData.populationSegment;
        }
        await openDataPlaceRepository.update(
          { uuid: nearbyMss.uuid },
          mssUpdates
        );
      }

      // Mettre à jour notre entrée Soliguide avec les IDs trouvés
      if (Object.keys(updates).length > 0) {
        await openDataPlaceRepository.update(
          { source: "soliguide", soliguideStructureId },
          updates
        );
      }
    }
  }

  private getDepartementCached(codePostal: string): string {
    if (!this.departementCache.has(codePostal)) {
      const departement = getDepartementFromCodePostal(codePostal);
      this.departementCache.set(codePostal, departement);
    }
    return this.departementCache.get(codePostal)!;
  }
}
