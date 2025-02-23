import {
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { MigrationInterface } from "typeorm";
import { OpenDataPlaceTable } from "../database/entities/open-data-place";
import { OpenDataPlace } from "../modules/open-data-places/interfaces";
import {
  appLogger,
  cleanAddress,
  cleanCity,
  cleanSpaces,
  FileManagerService,
  padPostalCode,
} from "../util";
import * as XLSX from "xlsx";
import { openDataPlaceRepository } from "../database";
import { getLocation } from "../structures/services/location.service";
import { domifaConfig } from "../config";
import { PassThrough } from "stream";
import { loadDomifaData } from "../modules/open-data-places/services/import-data/load-domifa";
import { loadMssData } from "../modules/open-data-places/services/import-data/load-mss";
import { loadSoliguideData } from "../modules/open-data-places/services/import-data/load-soliguide";

let logs: string[] = [];

// Override console methods to capture logs
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function (...args) {
  const message = args.join(" ");
  logs.push(`[INFO] ${new Date().toISOString()} - ${message}`);
  originalConsoleLog.apply(console, args);
};

console.warn = function (...args) {
  const message = args.join(" ");
  logs.push(`[WARN] ${new Date().toISOString()} - ${message}`);
  originalConsoleWarn.apply(console, args);
};

console.error = function (...args) {
  const message = args.join(" ");
  logs.push(`[ERROR] ${new Date().toISOString()} - ${message}`);
  originalConsoleError.apply(console, args);
};

export class ManualMigration1739981933530 implements MigrationInterface {
  private fileManager: FileManagerService;

  constructor() {
    this.fileManager = new FileManagerService();
  }

  public async uploadLogsToS3(path: string) {
    try {
      const logContent = logs.join("\n");
      const stream = new PassThrough();
      stream.write(logContent);
      stream.end();

      await this.fileManager.uploadFile(path, stream);
      logs = []; // Clear logs after successful upload

      originalConsoleLog(`Logs uploaded to ${path}`);
    } catch (error) {
      originalConsoleError("Error uploading logs:", error);
      throw error;
    }
  }

  public async up(): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await loadDomifaData();
      await loadSoliguideData();
      await loadMssData();

      const filePath = `${domifaConfig().upload.bucketRootDir}/file.xlsx`;
      const s3Response = await this.fileManager.getObject(filePath);

      if (!s3Response?.Body) {
        throw new Error("No excel file found in S3");
      }

      let newPlaces = 0;
      let existingPlaces = 0;
      let notExistingPlaces = 0;
      let updatedPlaces = 0;
      const incompletePlaces: any[] = [];

      try {
        appLogger.info("📑 Lecture du fichier Excel...");

        const chunks: Uint8Array[] = [];
        for await (const chunk of s3Response.Body as any) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        const workbook = XLSX.read(buffer, {
          type: "buffer",
          cellDates: true,
          cellNF: false,
          cellText: false,
        });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet, {
          header: [
            "nom_organisme",
            "nom_site",
            "adresse",
            "commune",
            "code_postal",
            "nb_personnes_domiciliees",
            "nb_attestations",
          ],
          range: 1,
        });

        appLogger.info(`${jsonData.length} places to import... `);

        for await (const row of jsonData) {
          // Vérification du nombre de domiciliés
          let nbDomicilies = parseInt(row.nb_personnes_domiciliees);
          if (isNaN(nbDomicilies)) {
            nbDomicilies = 0;
          }

          let nbAttestations = parseInt(row.nb_attestations);
          if (isNaN(nbAttestations)) {
            nbAttestations = 0;
          }

          // Vérification de l'adresse
          if (!row.adresse || row.adresse.trim() === "" || !row.code_postal) {
            incompletePlaces.push({
              ...row,
              reason: "Adresse manquante",
            });
            continue;
          }

          if (!row.nom_organisme) {
            incompletePlaces.push({
              ...row,
              reason: "Nom d'organisme manquant",
            });
            continue;
          }

          const postalCode = padPostalCode(row.code_postal?.toString());
          const departement = getDepartementFromCodePostal(postalCode);
          const city = cleanCity(row.commune);
          const address = `${cleanAddress(row.adresse)}, ${postalCode} ${city}`;
          const position = await getLocation(address);

          const organisationName = cleanSpaces(row.nom_organisme || "");
          const siteName = cleanSpaces(row.nom_site || "");

          const nom = organisationName
            ? siteName
              ? `${organisationName} - ${siteName}`
              : organisationName
            : siteName;

          if (!position) {
            incompletePlaces.push({
              ...row,
              reason: `Adresse non trouvée: ${address}`,
            });
            continue;
          }

          const openDataPlace: Partial<OpenDataPlace> = {
            nom,
            adresse: cleanAddress(row.adresse),
            codePostal: postalCode,
            ville: city,
            departement,
            structureType: "asso",
            region: getRegionCodeFromDepartement(departement),
            source: "dgcs",
            uniqueId: `${departement}_${row.nom_organisme}_${row.nom_site}`
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^a-z0-9_]/g, ""),
            software: "other",
            nbDomicilies,
            nbAttestations,
            latitude: position.coordinates[1],
            longitude: position.coordinates[0],
          };

          const existingPlace = await openDataPlaceRepository.findOneBy({
            source: "dgcs",
            uniqueId: openDataPlace.uniqueId,
          });

          const domifaPlaceExist: OpenDataPlace =
            await openDataPlaceRepository.findExistingPlaceFromDomiFa(
              openDataPlace.latitude,
              openDataPlace.longitude
            );

          if (domifaPlaceExist) {
            console.warn(`✅ [MATCH] [${domifaPlaceExist.domifaStructureId}]`);
            console.log(
              `- DomiFa: ${domifaPlaceExist.nom} (${domifaPlaceExist.adresse})`
            );
            console.log(
              `- DGCS: ${openDataPlace.nom} (${openDataPlace.adresse})\n`
            );

            existingPlaces++;
            openDataPlace.domifaStructureId =
              domifaPlaceExist.domifaStructureId;
            openDataPlace.software = "domifa";
            openDataPlace.nbDomiciliesDomifa =
              domifaPlaceExist.nbDomiciliesDomifa;

            await openDataPlaceRepository.update(
              {
                domifaStructureId: domifaPlaceExist.domifaStructureId,
              },
              {
                uniqueId: openDataPlace.uniqueId,
                nbDomicilies,
                nbDomiciliesDomifa: domifaPlaceExist.nbDomiciliesDomifa,
              }
            );
          } else {
            notExistingPlaces++;
            console.warn(
              `🔴 [NOT MATCH] ${openDataPlace.nom} ${openDataPlace.adresse}\n`
            );
          }

          if (!existingPlace) {
            newPlaces++;
            await openDataPlaceRepository.save(
              new OpenDataPlaceTable(openDataPlace)
            );
          } else {
            updatedPlaces++;
            await openDataPlaceRepository.update(
              {
                source: "dgcs",
                uniqueId: openDataPlace.uniqueId,
              },
              {
                ...openDataPlace,
              }
            );
          }
        }

        // Logs finaux
        console.log("✅ Import Excel data done");
        console.log(`🆕 ${newPlaces} places added`);
        console.log(`🔁 ${updatedPlaces} places updated`);
        console.log(`🔁 ${existingPlaces} places in DomiFa`);
        console.log(`🔁 ${notExistingPlaces} places not in DomiFa`);

        const date = new Date().toISOString().split("T")[0];
        await this.uploadLogsToS3(`logs/import-${date}.log`);

        if (incompletePlaces.length > 0) {
          console.log(`⚠️ ${incompletePlaces.length} places non importées:`);
          incompletePlaces.forEach((place) => {
            console.log(
              `- ${place.nom_organisme || "Sans nom"} : ${place.reason}`
            );
          });
        }
      } catch (error) {
        appLogger.error("❌ Erreur lors de l'import:", error);
        throw error;
      }
    }
  }

  public async down(): Promise<void> {}
}
