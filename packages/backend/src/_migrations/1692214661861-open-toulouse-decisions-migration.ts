import { MigrationInterface, QueryRunner } from "typeorm";
import * as fs from "fs-extra";

import { domifaConfig } from "../config";
import { XMLParser } from "fast-xml-parser";
import { writeFile } from "fs-extra";
import { usagerRepository } from "../database";

const STRUCTURE_ID = 1;

export class ManualMigration1692214661861 implements MigrationInterface {
  public async up(): Promise<void> {
    console.log("Récupération des décisions dans le fichier XML");
    await this.splitXML(
      `${domifaConfig().upload.basePath}/toulouse/Historique.XML`
    );
  }

  public splitXML = async (filePath: string) => {
    const xmlString = await fs.readFile(filePath, "utf-8");

    let parser = new XMLParser({
      attributeNamePrefix: "",
      textNodeName: "#text",
      ignoreAttributes: false,
    });

    const jsonObj = parser.parse(xmlString);
    parser = null;
    const historiques = jsonObj.HF_DOCUMENT.Historique;

    const usagers = await usagerRepository.find({
      where: { structureId: STRUCTURE_ID },
      select: ["ref"],
    });

    console.log(usagers.length + " dossiers dans la base");

    const refList = usagers.map((usager) => usager.ref);

    const decisions = historiques.filter(
      (histo: any) =>
        histo.id_domicilié &&
        ["creation", "renouv", "cloture", "resiliation"].indexOf(histo.type) !==
          -1 &&
        refList.includes(histo.id_domicilié)
    );

    console.log(decisions.length + " données à importer");

    const outputFile2 = `${
      domifaConfig().upload.basePath
    }toulouse/decisions.json`;
    console.log("Ecriture du fichier decisions.json");

    await writeFile(outputFile2, JSON.stringify(decisions));
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log("DOWN");
  }
}
