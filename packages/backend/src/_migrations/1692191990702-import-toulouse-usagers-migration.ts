import { isNil } from "lodash";
import { ucFirst } from "./../usagers/services/custom-docs/buildCustomDoc.service";
import { MigrationInterface } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Usager } from "../_common/model";
import {
  myDataSource,
  usagerNotesRepository,
  UsagerNotesTable,
  usagerRepository,
  UsagerTable,
} from "../database";

import { usagersCreator } from "../usagers/services";
import { domifaConfig } from "../config";
import { readFile } from "fs-extra";
import { differenceInCalendarDays } from "date-fns";
import {
  TOULOUSE_STRUCTURE_ID,
  TUsager,
  PAYS,
  getDateFromXml,
  getText,
  TOULOUSE_USER_ID,
} from "../_common/tmp-toulouse";
import {
  UsagerTypeDom,
  UsagerAyantDroit,
  StructureLight,
} from "@domifa/common";
import { resetUsagers } from "../structures/services";

export class ManualMigration1692191990702 implements MigrationInterface {
  name = "ImportUsagersFromJson1692191990702";
  public async up(): Promise<void> {
    await resetUsagers({ id: TOULOUSE_STRUCTURE_ID } as StructureLight);

    console.log("2️⃣  Début de l'import des domiciliés");

    const filePath = domifaConfig().upload.basePath + "usagers.json";
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

    const usagers = raw.filter(
      (usager: TUsager) => parseInt(usager?.enfant_de as string, 10) === 0
    );
    console.log("\t" + usagers.length + " dossiers uniques à importer");
    const ayantsDroits = raw.filter(
      (usager: TUsager) => parseInt(usager?.enfant_de as string, 10) !== 0
    );

    console.log("\t" + ayantsDroits.length + " ayants-drois à importer");

    const childrens = this.extractChidrens(ayantsDroits);
    let i = 0;

    const queryRunner = myDataSource.createQueryRunner();

    await queryRunner.startTransaction();

    for (const usagerToulouse of usagers) {
      if (i % 2000 === 0) {
        await queryRunner.commitTransaction();
        await queryRunner.startTransaction();
        console.log(i + "/" + usagers.length + " dossiers importés");
      }
      i++;
      let typeDom: UsagerTypeDom = "PREMIERE_DOM";

      if (
        usagerToulouse?.date_creation &&
        usagerToulouse?.du &&
        differenceInCalendarDays(
          getDateFromXml(usagerToulouse?.date_creation),
          getDateFromXml(usagerToulouse?.du)
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
          dateDebut = getDateFromXml(usagerToulouse.au);
          dateFin = getDateFromXml(usagerToulouse.au);
          dateDecision = getDateFromXml(usagerToulouse.au);
        } else if (usagerToulouse.dernier_retrait) {
          dateDebut = getDateFromXml(usagerToulouse.dernier_retrait);
          dateFin = getDateFromXml(usagerToulouse.dernier_retrait);
          dateDecision = getDateFromXml(usagerToulouse.dernier_retrait);
        } else {
          dateDebut = getDateFromXml(usagerToulouse.date_creation);
          dateFin = getDateFromXml(usagerToulouse.date_creation);
          dateDecision = getDateFromXml(usagerToulouse.date_creation);
        }
      } else {
        dateDebut = getDateFromXml(usagerToulouse.du);
        dateFin = getDateFromXml(usagerToulouse.au);
        dateDecision = getDateFromXml(usagerToulouse.du);
      }

      const lastInteractionDate = usagerToulouse?.dernier_retrait
        ? getDateFromXml(usagerToulouse?.dernier_retrait)
        : null;

      const partialUsager: Partial<Usager> = {
        ref: usagerToulouse.IDDomicilie,
        nom: usagerToulouse.Nom.trim().toUpperCase(),
        surnom: usagerToulouse?.Nom_epouse
          ? usagerToulouse?.Nom_epouse.toString().trim().toUpperCase()
          : null,
        prenom: usagerToulouse.prénom
          ? ucFirst(usagerToulouse.prénom).trim()
          : "Prénom",
        sexe: usagerToulouse.genre === 2 ? "homme" : "femme",
        telephone: {
          numero: usagerToulouse?.telephone ?? "",
          countryCode: "FR",
        },
        email: usagerToulouse?.email ?? null,
        villeNaissance: this.getBirthPlace(
          usagerToulouse?.lieu_naiss,
          usagerToulouse?.Pays_naissance
        ),
        ayantsDroits:
          typeof childrens[usagerToulouse.Num_domici.toString()] !== "undefined"
            ? childrens[usagerToulouse.Num_domici.toString()]
            : [],
        dateNaissance: getDateFromXml(usagerToulouse.date_naissance),
        customRef:
          usagerToulouse?.Num_domici?.toString() ??
          usagerToulouse.IDDomicilie.toString(),
        lastInteraction: {
          dateInteraction: lastInteractionDate,
          colisIn: 0,
          courrierIn: 0,
          recommandeIn: 0,
          enAttente: false,
        },
        historique: [],
        structureId: TOULOUSE_STRUCTURE_ID,
        decision: {
          uuid: uuidv4(),
          dateDecision,
          statut,
          userName: "Croix-Rouge Toulouse",
          userId: TOULOUSE_USER_ID,
          dateFin,
          dateDebut,
          typeDom,
          motif: usagerToulouse.valide !== 1 ? "AUTRE" : null,
          motifDetails: usagerToulouse.valide !== 1 ? "Non renseigné" : null,
        },
      };

      usagersCreator.setUsagerDefaultAttributes(partialUsager);
      const usager = new UsagerTable(partialUsager);
      await usagerRepository.save(usager);

      if (usagerToulouse?.procuration === 1) {
        const message = getText(usagerToulouse?.nom_procuration);

        await usagerNotesRepository.save(
          new UsagerNotesTable({
            message: `Procuration: ${message}`,
            usagerRef: usager.ref,
            usagerUUID: usager.uuid,
            pinned: false,
            structureId: TOULOUSE_STRUCTURE_ID,
            createdBy: {
              userName: "Croix-Rouge Toulouse",
              userId: TOULOUSE_USER_ID,
            },
            archived: false,
          })
        );
      }

      if (getText(usagerToulouse?.Remarques) !== "") {
        const newNote = new UsagerNotesTable({
          message: getText(usagerToulouse?.Remarques),
          usagerRef: usager.ref,
          usagerUUID: usager.uuid,
          pinned: true,
          structureId: TOULOUSE_STRUCTURE_ID,
          createdBy: {
            userName: "Croix-Rouge Toulouse",
            userId: TOULOUSE_USER_ID,
          },
          archived: false,
        });
        await usagerNotesRepository.save(newNote);

        await usagerRepository.update(
          { uuid: usager.uuid },
          {
            pinnedNote: {
              message: newNote.message,
              usagerRef: newNote.usagerRef,
              createdAt: newNote.createdAt,
              createdBy: newNote.createdBy,
            },
          }
        );
      }
    }

    await queryRunner.commitTransaction();
    await queryRunner.release();

    console.log("2️⃣ Import des usagers terminés ✅");
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
          dateNaissance: getDateFromXml(child.date_naissance),
          lien: "ENFANT",
        };
        const key = child.enfant_de.toString();
        if (typeof usagersByRef[key] === "undefined") {
          usagersByRef[key] = [];
        }
        usagersByRef[key].push(ayantDroit);
      }
    }

    return usagersByRef;
  };

  public getBirthPlace(villeNaissance?: string, pays?: number): string {
    if (
      typeof villeNaissance !== "string" ||
      isNil(villeNaissance) ||
      villeNaissance === ""
    ) {
      return "Non renseigné";
    }
    villeNaissance = villeNaissance.toString().trim();
    villeNaissance = ucFirst(villeNaissance);

    if (pays) {
      villeNaissance = villeNaissance + ", " + PAYS[pays];
    }
    return villeNaissance;
  }
}
