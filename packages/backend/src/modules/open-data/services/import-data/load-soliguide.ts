import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { domifaConfig } from "../../../../config";
import {
  findNetwork,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { getStructureType } from "../../functions";
import axios from "axios";
import { openDataPlaceRepository } from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data";
import { cleanCity, cleanSpaces, appLogger } from "../../../../util";
import { SoliguidePlace } from "../../interfaces";
import { OpenDataPlace } from "../../interfaces/OpenDataPlace.interface";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";

const RESULTS_BY_PAGE = 50;
const MAX_DISTANCE = 300;

@Injectable()
export class LoadSoliguideDataService {
  private page = 1;
  private nbResults = 0;
  private newPlaces = 0;
  private updatedPlaces = 0;
  private readonly departementCache = new Map<string, string>();

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    disabled: !isCronEnabled() || domifaConfig().envId !== "prod",
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

    const services = place.services_all.filter(
      (service) => service.category === "domiciliation"
    );

    const service = services[0];

    if (!service) {
      return;
    }

    const openDataPlace: Partial<OpenDataPlace> = {
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
      nom: cleanSpaces(place.name),
      adresse: place?.position?.adresse,
      codePostal: place.position.codePostal,
      ville: cleanCity(place?.position?.ville),
      departement,
      structureType: getStructureType(place.name),
      region: getRegionCodeFromDepartement(departement),
      latitude: place.position.location.coordinates[1],
      longitude: place.position.location.coordinates[0],
      source: "soliguide",
      mail: place?.entity?.mail?.toString() || null,
      soliguideStructureId: parseInt(place.lieu_id as any, 10),
      software: "other",
      saturation: service?.saturated?.status,
      saturationDetails: service?.saturated?.precision,
      reseau: findNetwork(cleanSpaces(place.name)),
    };

    // 1️⃣ Checker si un doublon Soliguide existe
    const existingSoliguidePlace = await openDataPlaceRepository.findOneBy({
      source: "soliguide",
      soliguideStructureId: openDataPlace.soliguideStructureId,
    });

    // 2️⃣ Checker si un doublon Domifa existe (géographiquement proche)
    const existingDomifaPlace = await openDataPlaceRepository.findNearbyPlaces(
      openDataPlace.latitude,
      openDataPlace.longitude,
      {
        source: "domifa",
        maxDistance: MAX_DISTANCE,
      }
    );

    // 3️⃣ Update ou Create
    if (existingSoliguidePlace) {
      // La fiche Soliguide existe → UPDATE
      await openDataPlaceRepository.update(
        {
          source: "soliguide",
          soliguideStructureId: openDataPlace.soliguideStructureId,
        },
        {
          nom: openDataPlace.nom,
          adresse: openDataPlace.adresse,
          codePostal: openDataPlace.codePostal,
          ville: openDataPlace.ville,
          departement: openDataPlace.departement,
          region: openDataPlace.region,
          latitude: openDataPlace.latitude,
          longitude: openDataPlace.longitude,
          saturation: openDataPlace.saturation,
          saturationDetails: openDataPlace.saturationDetails,
          reseau: openDataPlace.reseau,
          mail: openDataPlace.mail,
          updatedAt: openDataPlace.updatedAt,
        }
      );
      this.updatedPlaces++;

      // Si une fiche Domifa proche existe, la lier et mettre à jour saturation
      if (existingDomifaPlace) {
        await openDataPlaceRepository.update(
          {
            domifaStructureId: existingDomifaPlace.domifaStructureId,
          },
          {
            soliguideStructureId: openDataPlace.soliguideStructureId,
            saturation: openDataPlace.saturation,
            saturationDetails: openDataPlace.saturationDetails,
            reseau: openDataPlace.reseau,
          }
        );
      }
    } else {
      // La fiche Soliguide n'existe pas → CREATE
      this.newPlaces++;

      // Si une fiche Domifa existe, la lier directement
      if (existingDomifaPlace) {
        openDataPlace.domifaStructureId = existingDomifaPlace.domifaStructureId;
        openDataPlace.software = "domifa";
      }

      await openDataPlaceRepository.save(new OpenDataPlaceTable(openDataPlace));
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
