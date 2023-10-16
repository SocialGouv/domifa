import { XMLParser } from "fast-xml-parser";
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { readFile, writeFile } from "fs-extra";
import { usagerRepository } from "../database";
import { historiqueRepository } from "../database/services/interaction/historiqueRepository.service";

const STRUCTURE_ID = 1;

export class ManualMigration1697410497778 implements MigrationInterface {
  public async up(): Promise<void> {
    console.log("Récupération des courriers dans le fichier XML");
    await this.splitXML(
      `${domifaConfig().upload.basePath}/toulouse/Historique.XML`
    );
  }

  public splitXML = async (filePath: string) => {
    console.log("splitXML");
    const xmlString = await readFile(filePath, "utf-8");

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
    const interactions = historiques.filter(
      (histo: any) => histo.id_domicilié && refList.includes(histo.id_domicilié)
    );

    console.log();
    let toSave = [];

    for (let i = 0; i < interactions.length; i++) {
      if (i % 400 === 0) {
        console.log(`${i}/${interactions.length} enregistrements`);
        await historiqueRepository.save(toSave);
        toSave = [];
      } else {
        toSave.push(interactions[i]);
      }
    }

    const outputFile2 = `${
      domifaConfig().upload.basePath
    }toulouse/courriers.json`;
    console.log("Ecriture du fichier courriers.json");

    await writeFile(outputFile2, JSON.stringify(interactions));
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log("DOWN");
  }
}
