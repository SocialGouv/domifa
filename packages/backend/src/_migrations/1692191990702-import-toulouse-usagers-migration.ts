import { MigrationInterface } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import {
  Usager,
  UsagerAyantDroit,
  StructureLight,
  UsagerTypeDom,
} from "../_common/model";
import { usagerRepository, UsagerTable } from "../database";

import { usagersCreator } from "../usagers/services";
import { TUsager } from "./tmp-toulouse/TUsager.interface";
import { domifaConfig } from "../config";
import { readFile } from "fs-extra";
import { differenceInCalendarDays, isValid, parse, startOfDay } from "date-fns";
import { resetUsagers } from "../structures/services";

const STRUCTURE_ID = 1;

export class ManualMigration1692191990702 implements MigrationInterface {
  public async up(): Promise<void> {
    console.log("2️⃣  Début de l'import des domiciliés");

    await resetUsagers({ id: STRUCTURE_ID } as StructureLight);

    const filePath = domifaConfig().upload.basePath + "/toulouse/usagers.json";
    const jsonData = await readFile(filePath, "utf8");

    let raw = JSON.parse(jsonData).HF_DOCUMENT.Domicilie as TUsager[];

    console.log("");
    console.log(raw.length + " dossiers à importer");
    console.log("");

    raw = raw.filter(
      (usager: TUsager) =>
        usager.date_naissance !== "0" &&
        usager.date_naissance !== "" &&
        usager.date_naissance !== 0
    );

    const usagers = raw.filter((usager: TUsager) => usager?.enfant_de === 0);
    console.log("\t" + usagers.length + " dossiers uniques à importer");

    const tmpChildrens = raw.filter(
      (usager: TUsager) => usager?.enfant_de !== 0
    );
    console.log("\t" + tmpChildrens.length + " ayants-drois à importer");

    const childrens = this.extractChidrens(tmpChildrens);

    let i = 0;
    let usagersToSave = [];

    for (const usagerToulouse of usagers) {
      if (i % 400 === 0) {
        await usagerRepository.save(usagersToSave);
        usagersToSave = [];
      }

      if (i % 1000 === 0) {
        console.log(i + "/" + usagers.length + " dossiers importés");
      }
      i++;
      let typeDom: UsagerTypeDom = "PREMIERE_DOM";

      if (
        usagerToulouse?.date_creation &&
        usagerToulouse?.du &&
        differenceInCalendarDays(
          this.getDate(usagerToulouse?.date_creation),
          this.getDate(usagerToulouse?.du)
        ) > 0
      ) {
        typeDom = "RENOUVELLEMENT";
      }

      const statut = usagerToulouse.valide === 1 ? "VALIDE" : "RADIE";
      let dateDebut: Date;
      let dateFin: Date;
      let dateDecision: Date;

      if (statut === "RADIE") {
        if (usagerToulouse.au) {
          dateDebut = this.getDate(usagerToulouse.au);
          dateFin = this.getDate(usagerToulouse.au);
          dateDecision = this.getDate(usagerToulouse.au);
        } else if (usagerToulouse.dernier_retrait) {
          dateDebut = this.getDate(usagerToulouse.dernier_retrait);
          dateFin = this.getDate(usagerToulouse.dernier_retrait);
          dateDecision = this.getDate(usagerToulouse.dernier_retrait);
        } else {
          dateDebut = this.getDate(usagerToulouse.date_creation);
          dateFin = this.getDate(usagerToulouse.date_creation);
          dateDecision = this.getDate(usagerToulouse.date_creation);
        }
      } else {
        dateDebut = this.getDate(usagerToulouse.du);
        dateFin = this.getDate(usagerToulouse.au);
        dateDecision = this.getDate(usagerToulouse.du);
      }

      const lastInteractionDate = usagerToulouse?.dernier_retrait
        ? this.getDate(usagerToulouse?.dernier_retrait)
        : dateDebut;

      const partialUsager: Partial<Usager> = {
        ref: usagerToulouse.IDDomicilie,
        nom: usagerToulouse.Nom,
        surnom: usagerToulouse?.Nom_epouse ?? null,
        prenom: usagerToulouse.prénom,
        sexe: usagerToulouse.genre === 2 ? "homme" : "femme",
        telephone: {
          numero: usagerToulouse?.telephone ?? "",
          countryCode: "FR",
        },
        email: usagerToulouse?.email ?? null,
        villeNaissance: usagerToulouse?.lieu_naiss ?? "Non renseigné",
        ayantsDroits:
          typeof childrens[usagerToulouse.IDDomicilie] !== "undefined"
            ? childrens[usagerToulouse.IDDomicilie]
            : [],
        dateNaissance: this.getDate(usagerToulouse.date_naissance),
        customRef:
          usagerToulouse?.Num_domici.toString() ??
          usagerToulouse.IDDomicilie.toString(),
        lastInteraction: {
          dateInteraction: lastInteractionDate,
          colisIn: 0,
          courrierIn: 0,
          recommandeIn: 0,
          enAttente: false,
        },
        historique: [],
        structureId: STRUCTURE_ID,
        decision: {
          uuid: uuidv4(),
          dateDecision,
          statut,
          userName: "DomiFa",
          userId: 1200,
          dateFin,
          dateDebut,
          typeDom,
          motif: usagerToulouse.valide !== 1 ? "AUTRE" : null,
          motifDetails: usagerToulouse.valide !== 1 ? "Non renseigné" : null,
        },
      };

      const usager = new UsagerTable(partialUsager);
      usagersCreator.setUsagerDefaultAttributes(usager);
      usagersToSave.push(usager);
    }
    await usagerRepository.save(usagersToSave);

    console.log("2️⃣ ✅Import des usagers terminés");
  }

  public async down(): Promise<void> {
    console.log("down");
  }

  public extractChidrens = (
    tmpChildrens: TUsager[]
  ): {
    [key: number]: UsagerAyantDroit[];
  } => {
    const usagersByRef = {};

    for (const child of tmpChildrens) {
      if (child.date_naissance) {
        const ayantDroit: UsagerAyantDroit = {
          nom: child.Nom,
          prenom: child.prénom,
          dateNaissance: this.getDate(child.date_naissance),
          lien: "ENFANT",
        };
        if (typeof usagersByRef[child.enfant_de] === "undefined") {
          usagersByRef[child.enfant_de] = [];
        }
        usagersByRef[child.enfant_de].push(ayantDroit);
      }
    }

    return usagersByRef;
  };

  public getDate = (dateString: string): Date => {
    const parsedDate = startOfDay(parse(dateString, "yyyyMMdd", new Date()));
    if (!isValid(parsedDate)) {
      throw new Error("CANNOT ADD DATE " + dateString);
    }
    return parsedDate;
  };
}
