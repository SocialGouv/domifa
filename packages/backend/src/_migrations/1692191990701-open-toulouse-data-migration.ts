import { XMLParser } from "fast-xml-parser";
import { readFile, writeFile } from "fs-extra";
import { MigrationInterface } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1692191990701 implements MigrationInterface {
  public async up(): Promise<void> {
    const inputFile =
      domifaConfig().upload.basePath + "/toulouse/Domicilie.XML";

    const outputFile =
      domifaConfig().upload.basePath + "/toulouse/usagers.json";

    readFile(inputFile, "utf8", (err, xmlData) => {
      if (err) {
        console.error(
          `Erreur lors de la lecture du fichier XML : ${err.message}`
        );
        return;
      }

      const options = {
        attributeNamePrefix: "_",
        attrNodeName: "attr",
        textNodeName: "#text",
        ignoreAttributes: false,
        parseAttributeValue: true,
      };

      const parser = new XMLParser(options);
      const jsonData = parser.parse(xmlData);

      // Écriture du fichier JSON
      writeFile(
        outputFile,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (writeErr) => {
          if (writeErr) {
            console.error(
              `Erreur lors de l'écriture du fichier JSON : ${writeErr.message}`
            );
            return;
          }
          console.log(
            "Conversion réussie ! Fichier sauvegardé à l'emplacement :" +
              outputFile
          );
        }
      );
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(): Promise<void> {
    /* document why this async method 'down' is empty */
  }
}
