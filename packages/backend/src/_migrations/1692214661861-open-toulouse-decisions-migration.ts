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

    const parser = new XMLParser({
      attributeNamePrefix: "",
      textNodeName: "#text",
      ignoreAttributes: false,
    });

    const jsonObj = parser.parse(xmlString);
    const historiques = jsonObj.HF_DOCUMENT.Historique;

    // const courriers = historiques.filter(
    //   (histo: any) => histo.type === "courrier"
    // );

    // const outputFile1 = `${
    //   domifaConfig().upload.basePath
    // }toulouse/courriers.json`;

    // await writeFile(outputFile1, JSON.stringify(courriers));

    const usagers = await usagerRepository.find({
      where: { structureId: STRUCTURE_ID },
      select: ["ref"],
    });

    console.log(usagers.length + " dossiers dans la base");

    const refList = usagers.map((usager) => usager.ref);

    const all = historiques.filter(
      (histo: any) =>
        histo.id_domicilié &&
        ["creation", "renouv", "cloture", "resiliation"].indexOf(histo.type) !==
          -1 &&
        refList.includes(histo.id_domicilié)
    );

    console.log(all.length + " données à importer");

    const outputFile2 = `${
      domifaConfig().upload.basePath
    }toulouse/decisions.json`;
    console.log("Ecriture du fichier decisions.json");

    await writeFile(outputFile2, JSON.stringify(all));
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log("DOWN");
  }
}
