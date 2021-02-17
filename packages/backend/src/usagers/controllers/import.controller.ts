import {
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import * as XLSX from "xlsx";
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerDecisionStatut, UsagerPG, UsagerTable } from "../../database";
import { UsagerDecisionMotif } from "../../database/entities/usager/UsagerDecisionMotif.type";
import { StructuresService } from "../../structures/services/structures.service";
import { appLogger } from "../../util";
import { ExpressResponse } from "../../util/express";
import { randomName, validateUpload } from "../../util/FileManager";
import { ALLOWED_MOTIF_VALUES } from "../../_common/import/ALLOWED_MOTIF_VALUES.const";
import {
  ACCOMPAGNEMENT,
  ACCOMPAGNEMENT_DETAILS,
  AYANT_DROIT,
  CAUSE_DETAILS,
  CAUSE_INSTABILITE,
  CIVILITE,
  COMMENTAIRES,
  COMPOSITION_MENAGE,
  CUSTOM_ID,
  DATE_DEBUT_DOM,
  DATE_DERNIER_PASSAGE,
  DATE_FIN_DOM,
  DATE_NAISSANCE,
  DATE_PREMIERE_DOM,
  DOMICILIATION_EXISTANTE,
  EMAIL,
  LIEN_COMMUNE,
  LIEU_NAISSANCE,
  MOTIF_RADIATION,
  MOTIF_REFUS,
  NOM,
  ORIENTATION,
  ORIENTATION_DETAILS,
  PHONE,
  PRENOM,
  RAISON_DEMANDE,
  RAISON_DEMANDE_DETAILS,
  REVENUS,
  REVENUS_DETAILS,
  SITUATION_DETAILS,
  SITUATION_RESIDENTIELLE,
  STATUT_DOM,
  SURNOM,
  TYPE_DOM,
} from "../../_common/import/COLUMNS_INDEX.const";
import {
  isValidDate,
  isValidEmail,
  isValidPhone,
  isValidValue,
  notEmpty,
} from "../../_common/import/import.validators";
import { AppAuthUser } from "../../_common/model";
import { Entretien } from "../interfaces/entretien";
import { UsagersService } from "../services/usagers.service";

import moment = require("moment");

type AOA = any[][];

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("import")
@ApiBearerAuth()
@Controller("import")
export class ImportController {
  public colNames: string[];

  constructor(
    private readonly usagersService: UsagersService,
    private readonly structureService: StructuresService
  ) {
    this.colNames = [
      "Numéro d'identification",
      "Civilité",
      "Nom",
      "Prénom",
      "Nom d'usage / Surnom",
      "Date naissance",
      "Lieu naissance",
      "Téléphone",
      "Email",
      "Statut domiciliation",
      "Motif de refus",
      "Motif de radiation",
      "Type de domiciliation",
      "Date de Début de la domiciliation",
      "Date de fin de la domiciliation",
      "Date 1ere domiciliation",
      "Date de dernier passage",
      "Orientation",
      "Détails de l'orientation",
      "La personne a t-elle déjà une domiciliation ?",
      "Le domicilié possède t-il des revenus ?",
      "Seulement si revenus, de quelle nature ?",
      "Lien avec la commune",
      "Composition du ménage",
      "Situation résidentielle",
      "Si autre situation résidentielle, précisez",
      "Cause instabilité logement",
      "Si autre cause, précisez",
      "Motif principal de la demande",
      "Si autre motif, précisez",
      "Accompagnement social",
      "Par quelle structure est fait l'accompagnement ?",
      "Commentaires",
      "Ayant-droit 1: nom",
      "Ayant-droit 1: prénom",
      "Ayant-droit 1: date naissance",
      "Ayant-droit 1: lien parenté",
      "Ayant-droit 2: nom",
      "Ayant-droit 2: prénom",
      "Ayant-droit 2: date naissance",
      "Ayant-droit 2: lien parenté",
      "Ayant-droit 3: nom",
      "Ayant-droit 3: prénom",
      "Ayant-droit 3: date naissance",
      "Ayant-droit 3: lien parenté",
      "Ayant-droit 4: nom",
      "Ayant-droit 4: prénom",
      "Ayant-droit 4: date de naissance",
      "Ayant-droit 4: lien parenté",
    ];
  }

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fieldSize: 10 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (!validateUpload("IMPORT", req, file)) {
          throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req: any, file: Express.Multer.File, cb: any) => {
          const dir = path.resolve(__dirname, "../../imports/");
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },

        filename: (req: any, file: Express.Multer.File, cb: any) => {
          return cb(null, randomName(file));
        },
      }),
    })
  )
  public async importExcel(
    @Res() res: ExpressResponse,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AppAuthUser
  ) {
    const today = moment.utc().endOf("day").toDate();
    const nextYear = moment.utc().add(1, "year").endOf("day").toDate();
    const minDate = moment
      .utc("01/01/1900", "DD/MM/YYYY")
      .endOf("day")
      .toDate();

    const dir = path.resolve(__dirname, "../../imports/");
    const fileName = file.filename;
    const filePath = dir + "/" + fileName;
    const structureId = user.structureId;
    const importContext = { fileName, filePath, structureId };
    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, {
      dateNF: "dd/mm/yyyy",
      type: "buffer",
    });

    const errorsId: {
      rowId: string;
      columnId: number;
      value: any;
      label: string;
    }[] = [];
    let rowNumber = 0;

    if (!buffer) {
      return false;
    } else {
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const datas: AOA = XLSX.utils.sheet_to_json(ws, {
        blankrows: false,
        dateNF: "dd/mm/yyyy",
        header: 1,
        raw: false,
      }) as AOA;

      for (let rowIndex = 1, len = datas.length; rowIndex < len; rowIndex++) {
        // Ligne
        rowNumber = rowIndex;
        const row = datas[rowIndex];

        // Check le sexe
        const sexeCheck =
          row[CIVILITE].toUpperCase() === "H" ||
          row[CIVILITE].toUpperCase() === "F";

        this.countErrors(sexeCheck, rowIndex, CIVILITE, datas, errorsId);

        this.countErrors(notEmpty(row[NOM]), rowIndex, NOM, datas, errorsId);

        this.countErrors(
          notEmpty(row[PRENOM]),
          rowIndex,
          PRENOM,
          datas,
          errorsId
        );

        this.countErrors(
          isValidDate(row[DATE_NAISSANCE], {
            required: true,
            minDate,
            maxDate: today,
          }),
          rowIndex,
          DATE_NAISSANCE,
          datas,
          errorsId
        );

        this.countErrors(
          notEmpty(row[LIEU_NAISSANCE]),
          rowIndex,
          LIEU_NAISSANCE,
          datas,
          errorsId
        );

        this.countErrors(
          isValidEmail(row[EMAIL]),
          rowIndex,
          EMAIL,
          datas,
          errorsId
        );

        this.countErrors(
          isValidPhone(row[PHONE]),
          rowIndex,
          PHONE,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[STATUT_DOM], "statut", true),
          rowIndex,
          STATUT_DOM,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[TYPE_DOM], "demande", true),
          rowIndex,
          TYPE_DOM,
          datas,
          errorsId
        );

        this.countErrors(
          isValidDate(row[DATE_PREMIERE_DOM], {
            required: false,
            minDate,
            maxDate: today,
          }),
          rowIndex,
          DATE_PREMIERE_DOM,
          datas,
          errorsId
        );

        // SI Refus & Radié, on ne tient pas compte des dates suivantes : date de début, date de fin, date de dernier passage
        const dateIsRequired =
          row[STATUT_DOM] !== "REFUS" && row[STATUT_DOM] !== "RADIE";

        this.countErrors(
          isValidDate(row[DATE_DEBUT_DOM], {
            required: dateIsRequired,
            minDate,
            maxDate: today,
          }),
          rowIndex,
          DATE_DEBUT_DOM,
          datas,
          errorsId
        );

        this.countErrors(
          isValidDate(row[DATE_FIN_DOM], {
            required: dateIsRequired,
            minDate,
            maxDate: nextYear,
          }),
          rowIndex,
          DATE_FIN_DOM,
          datas,
          errorsId
        );

        this.countErrors(
          isValidDate(row[DATE_DERNIER_PASSAGE], {
            required: false,
            minDate,
            maxDate: today,
          }),
          rowIndex,
          DATE_DERNIER_PASSAGE,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[MOTIF_REFUS], "motifRefus"),
          rowIndex,
          MOTIF_REFUS,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[MOTIF_RADIATION], "motifRadiation"),
          rowIndex,
          MOTIF_RADIATION,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[COMPOSITION_MENAGE], "menage"),
          rowIndex,
          COMPOSITION_MENAGE,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[RAISON_DEMANDE], "raison"),
          rowIndex,
          RAISON_DEMANDE,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[CAUSE_INSTABILITE], "cause"),
          rowIndex,
          CAUSE_INSTABILITE,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[SITUATION_RESIDENTIELLE], "residence"),
          rowIndex,
          SITUATION_RESIDENTIELLE,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[ORIENTATION], "choix"),
          rowIndex,
          ORIENTATION,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[DOMICILIATION_EXISTANTE], "choix"),
          rowIndex,
          DOMICILIATION_EXISTANTE,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[REVENUS], "choix"),
          rowIndex,
          REVENUS,
          datas,
          errorsId
        );

        this.countErrors(
          isValidValue(row[ACCOMPAGNEMENT], "choix"),
          rowIndex,
          ACCOMPAGNEMENT,
          datas,
          errorsId
        );

        for (const indexAyantDroit of AYANT_DROIT) {
          const nom = row[indexAyantDroit];
          const prenom = row[indexAyantDroit + 1];
          const dateNaissance = row[indexAyantDroit + 2];
          const lienParente = row[indexAyantDroit + 3];

          if (nom && prenom && dateNaissance && lienParente) {
            this.countErrors(
              notEmpty(nom),
              rowNumber,
              indexAyantDroit,
              datas,
              errorsId
            );

            this.countErrors(
              notEmpty(prenom),
              rowNumber,
              indexAyantDroit + 1,
              datas,
              errorsId
            );

            this.countErrors(
              isValidDate(dateNaissance, {
                required: true,
                minDate,
                maxDate: today,
              }),
              rowNumber,
              indexAyantDroit + 2,
              datas,
              errorsId
            );

            this.countErrors(
              isValidValue(lienParente, "lienParente", true),
              rowNumber,
              indexAyantDroit + 3,
              datas,
              errorsId
            );
          }
        }

        if (rowIndex + 1 >= datas.length) {
          if (errorsId.length > 0) {
            const error = {
              ids: JSON.stringify(errorsId),
              message: "IMPORT_ERRORS_BACKEND",
            };

            appLogger.error(`Import error for structure ${structureId}`, {
              sentry: true,
              extra: {
                ...importContext,
                errorsId,
              },
            });

            throw new HttpException(error, HttpStatus.BAD_REQUEST);
          }

          try {
            fs.unlinkSync(dir + "/" + file.filename);
          } catch (err) {
            throw new HttpException(
              "IMPORTE_DELETE_FILE_IMPOSSIBLE",
              HttpStatus.BAD_REQUEST
            );
          }

          if (await this.saveDatas(datas, user)) {
            this.structureService.importSuccess(user.structureId);
            return res.status(HttpStatus.OK).json({ success: true });
          } else {
            throw new HttpException(
              "IMPORT_NOT_COMPLETED",
              HttpStatus.BAD_REQUEST
            );
          }
        }
      }
    }
  }

  private async saveDatas(datas: AOA, @CurrentUser() user: AppAuthUser) {
    //
    const now = moment().toDate();
    const agent = user.prenom + " " + user.nom;
    const usagers: UsagerTable[] = [];

    for (let rowIndex = 1, len = datas.length; rowIndex < len; rowIndex++) {
      // Ligne du fichier
      const row = datas[rowIndex];

      // Infos générales
      const sexe = row[CIVILITE] === "H" ? "homme" : "femme";
      let motif: UsagerDecisionMotif;

      // Tableaux d'ayant-droit & historique
      const ayantsDroits = [];
      const historique = [];

      //
      //
      // Partie STATUT + HISTORIQUE
      //
      let datePremiereDom = now;
      let dateDecision = notEmpty(row[DATE_DEBUT_DOM])
        ? this.convertDate(row[DATE_DEBUT_DOM])
        : now;

      if (notEmpty(row[DATE_PREMIERE_DOM])) {
        datePremiereDom = this.convertDate(row[DATE_PREMIERE_DOM]);

        const dateFinPremiereDom = moment(datePremiereDom)
          .add(1, "year")
          .toDate();

        historique.push({
          agent,
          dateDebut: datePremiereDom,
          dateDecision: datePremiereDom,
          dateFin: dateFinPremiereDom,
          motif,
          statut: "PREMIERE_DOM",
          userId: user.id,
          userName: agent,
        });
      } else if (notEmpty(row[DATE_DEBUT_DOM])) {
        datePremiereDom = this.convertDate(row[DATE_DEBUT_DOM]);
      }

      historique.push({
        agent,
        dateDebut: now,
        dateDecision: now,
        dateFin: now,
        motif,
        statut: "IMPORT",
        userId: user.id,
        userName: agent,
      });

      const customRef = notEmpty(row[CUSTOM_ID]) ? row[CUSTOM_ID] : null;

      const phone = notEmpty(row[PHONE]) ? row[PHONE].replace(/\D/g, "") : null;

      const email = notEmpty(row[EMAIL]) ? row[EMAIL] : null;

      //
      // Dates
      //
      const dernierPassage = notEmpty(row[DATE_DERNIER_PASSAGE])
        ? this.convertDate(row[DATE_DERNIER_PASSAGE])
        : now;

      let dateDebut = notEmpty(row[DATE_DEBUT_DOM])
        ? this.convertDate(row[DATE_DEBUT_DOM])
        : null;

      const dateFin = notEmpty(row[DATE_FIN_DOM])
        ? this.convertDate(row[DATE_FIN_DOM])
        : null;

      if (row[STATUT_DOM] === "REFUS") {
        motif = this.parseMotif(row[MOTIF_REFUS]);

        dateDebut = this.convertDate(row[DATE_FIN_DOM]);
        dateDecision = this.convertDate(row[DATE_FIN_DOM]);
      }

      if (row[STATUT_DOM] === "RADIE") {
        dateDecision = notEmpty(row[DATE_FIN_DOM])
          ? this.convertDate(row[DATE_FIN_DOM])
          : now;

        motif = this.parseMotif(row[MOTIF_RADIATION]);
      }

      //
      // Partie ENTRETIEN
      //
      const entretien: Entretien = {};

      if (notEmpty(row[COMPOSITION_MENAGE])) {
        entretien.typeMenage = row[COMPOSITION_MENAGE].toUpperCase();
      }

      if (notEmpty(row[DOMICILIATION_EXISTANTE])) {
        entretien.domiciliation = this.convertChoix(
          row[DOMICILIATION_EXISTANTE]
        );
      }

      if (notEmpty(row[ACCOMPAGNEMENT])) {
        entretien.accompagnement = this.convertChoix(row[ACCOMPAGNEMENT]);

        if (
          notEmpty(row[ACCOMPAGNEMENT_DETAILS]) &&
          row[ACCOMPAGNEMENT] === "OUI"
        ) {
          entretien.accompagnementDetail = row[ACCOMPAGNEMENT_DETAILS];
        }
      }

      if (notEmpty(row[REVENUS])) {
        entretien.revenus = this.convertChoix(row[REVENUS]);
        if (notEmpty(row[REVENUS_DETAILS]) && row[REVENUS] === "OUI") {
          entretien.revenusDetail = row[REVENUS_DETAILS];
        }
      }

      if (notEmpty(row[ORIENTATION])) {
        entretien.orientation = this.convertChoix(row[ORIENTATION]);

        if (notEmpty(row[ORIENTATION_DETAILS]) && row[ORIENTATION] === "OUI") {
          entretien.orientationDetail = row[ORIENTATION_DETAILS];
        }
      }

      if (notEmpty(row[RAISON_DEMANDE])) {
        entretien.raison = row[RAISON_DEMANDE].toUpperCase();
      }

      if (notEmpty(row[RAISON_DEMANDE_DETAILS])) {
        entretien.raisonDetail = row[RAISON_DEMANDE_DETAILS];
      }

      if (notEmpty(row[LIEN_COMMUNE])) {
        entretien.liencommune = row[LIEN_COMMUNE];
      }

      if (notEmpty(row[SITUATION_RESIDENTIELLE])) {
        entretien.residence = row[SITUATION_RESIDENTIELLE].toUpperCase();
      }

      if (notEmpty(row[SITUATION_DETAILS])) {
        entretien.residenceDetail = row[SITUATION_DETAILS];
      }

      if (notEmpty(row[CAUSE_INSTABILITE])) {
        entretien.cause = row[CAUSE_INSTABILITE].toUpperCase();
      }

      if (notEmpty(row[CAUSE_DETAILS])) {
        entretien.causeDetail = row[CAUSE_DETAILS];
      }

      if (notEmpty(row[COMMENTAIRES])) {
        entretien.commentaires = row[COMMENTAIRES];
      }

      //
      // AYANT-DROIT
      //
      for (const indexAyantDroit of AYANT_DROIT) {
        const nom = row[indexAyantDroit];
        const prenom = row[indexAyantDroit + 1];
        const dateNaissance = row[indexAyantDroit + 2];
        const lienParente = row[indexAyantDroit + 3];

        if (nom && prenom && dateNaissance && lienParente) {
          ayantsDroits.push({
            nom,
            prenom,
            dateNaissance,
            lien: lienParente.toString().toUpperCase(),
          });
        }
      }

      // Enregistrement
      const usager: Partial<UsagerPG> = {
        ayantsDroits,
        customRef,
        dateNaissance: this.convertDate(row[DATE_NAISSANCE]),
        datePremiereDom,
        decision: {
          dateDebut,
          dateDecision,
          dateFin,
          motif,
          motifDetails: "",
          statut: row[STATUT_DOM].toUpperCase() as UsagerDecisionStatut,
          userId: user.id,
          userName: agent,
        },
        lastInteraction: {
          dateInteraction: dernierPassage,
        },
        email,
        entretien,
        etapeDemande: 5,
        historique,
        nom: row[NOM],
        phone,
        prenom: row[PRENOM],
        sexe,
        structureId: user.structureId,
        surnom: row[SURNOM],
        typeDom: row[TYPE_DOM].toUpperCase(),
        villeNaissance: row[LIEU_NAISSANCE],
      };

      const newUsager = await this.usagersService.createFromImport({
        data: usager,
        user,
      });
      usagers.push(newUsager);

      if (rowIndex + 1 >= datas.length) {
        return true;
      }
    }
  }

  private convertChoix(value: any): boolean {
    return value === "OUI" ? true : false;
  }

  private convertDate(dateFr: string): Date {
    const momentDate = moment.utc(dateFr, "DD/MM/YYYY").startOf("day").toDate();
    return momentDate;
  }

  private countErrors(
    variable: boolean,
    idRow: number,
    idColumn: number,
    datas: AOA,
    errorsId: {
      rowId: string;
      columnId: number;
      value: any;
      label: string;
    }[]
  ): void {
    const position = {
      rowId: idRow.toString(),
      columnId: idColumn,
      value: datas[idRow][idColumn],
      label: this.colNames[idColumn],
    };

    if (variable !== true) {
      appLogger.warn(`[IMPORT]: Import Error `, {
        context: JSON.stringify(position),
        sentryBreadcrumb: true,
      });
      errorsId.push(position);
    }
  }

  private parseMotif(value: string): UsagerDecisionMotif {
    if (!value || !value.trim()) {
      return "AUTRE";
    }
    const motifIndex = ALLOWED_MOTIF_VALUES.indexOf(
      value.trim() as UsagerDecisionMotif
    );
    if (motifIndex !== -1) {
      return ALLOWED_MOTIF_VALUES[motifIndex];
    }
    return null;
  }
}
