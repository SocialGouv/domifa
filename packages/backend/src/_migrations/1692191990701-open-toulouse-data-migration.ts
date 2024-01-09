import { XMLParser } from "fast-xml-parser";
import { readFile, writeFile } from "fs-extra";
import { MigrationInterface } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1692191990701 implements MigrationInterface {
  name = "OpenDomicilieXmlMigration1692191990701";

  public async up(): Promise<void> {
    const inputFile =
      domifaConfig().upload.basePath + "/toulouse/Domicilie.XML";

    const outputFile =
      domifaConfig().upload.basePath + "/toulouse/usagers.json";

    const xmlData = await readFile(inputFile, "utf8");

    const options = {
      attributeNamePrefix: "_",
      attrNodeName: "attr",
      textNodeName: "#text",
      ignoreAttributes: false,
      parseAttributeValue: true,
    };

    const parser = new XMLParser(options);
    const jsonData = parser.parse(xmlData);

    await writeFile(outputFile, JSON.stringify(jsonData, null, 2), "utf8");
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(): Promise<void> {
    /* document why this async method 'down' is empty */
  }
}
