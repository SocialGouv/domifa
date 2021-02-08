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
import { diskStorage } from "multer";

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { UsagerDecisionStatut, UsagerPG, UsagerTable } from "../../database";
import { UsagerDecisionMotif } from "../../database/entities/usager/UsagerDecisionMotif.type";
import { StructuresService } from "../../structures/services/structures.service";
import { ExpressResponse } from "../../util/express";
import { randomName, validateUpload } from "../../util/FileManager";
import { AppAuthUser } from "../../_common/model";
import { Entretien } from "../interfaces/entretien";
import { UsagersService } from "../services/usagers.service";

import moment = require("moment");
import { appLogger } from "../../util";
import { COLUMNS_HEADERS } from "../../_common/import/COLUMNS_HEADERS.const";

import {
  isValidEmail,
  isValidPhone,
  isValidValue,
  notEmpty,
  regexp,
} from "../../_common/import/import.validators";
import { ALLOWED_MOTIF_VALUES } from "../../_common/import/ALLOWED_MOTIF_VALUES.const";

import {
  CUSTOM_ID,
  CIVILITE,
  NOM,
  PRENOM,
  SURNOM,
  DATE_NAISSANCE,
  LIEU_NAISSANCE,
  PHONE,
  EMAIL,
  STATUT_DOM,
  MOTIF_REFUS,
  MOTIF_RADIATION,
  TYPE_DOM,
  DATE_DEBUT_DOM,
  DATE_FIN_DOM,
  DATE_PREMIERE_DOM,
  DATE_DERNIER_PASSAGE,
  ORIENTATION,
  ORIENTATION_DETAILS,
  DOMICILIATION_EXISTANTE,
  REVENUS,
  REVENUS_DETAILS,
  LIEN_COMMUNE,
  COMPOSITION_MENAGE,
  SITUATION_RESIDENTIELLE,
  SITUATION_DETAILS,
  CAUSE_INSTABILITE,
  CAUSE_DETAILS,
  RAISON_DEMANDE,
  RAISON_DEMANDE_DETAILS,
  ACCOMPAGNEMENT,
  ACCOMPAGNEMENT_DETAILS,
  COMMENTAIRES,
  AYANT_DROIT,
} from "../../_common/import/COLUMNS_INDEX.const";

type AOA = any[][];

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("import")
@ApiBearerAuth()
@Controller("import")
export class ImportController {
  public errorsId: any[];
  public columnsHeaders: string[];
  public rowNumber: number;
  public datas: AOA = [[], []];

  public today: Date;
  public nextYear: Date;
  public minDate: Date;

  private readonly logger = new Logger(ImportController.name);

  constructor(
    private readonly usagersService: UsagersService,
    private readonly structureService: StructuresService
  ) {
    this.today = moment().endOf("day").toDate();
    this.nextYear = moment().add(1, "year").endOf("day").toDate();
    this.minDate = moment("01/01/1900", "DD/MM/YYYY").endOf("day").toDate();

    this.errorsId = [];
    this.rowNumber = 0;
    this.datas = [[], []];

    this.columnsHeaders = COLUMNS_HEADERS;
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

    if (!buffer) {
      return false;
    } else {
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.datas = XLSX.utils.sheet_to_json(ws, {
        blankrows: false,
        dateNF: "dd/mm/yyyy",
        header: 1,
        raw: false,
      }) as AOA;

      for (
        let rowIndex = 1, len = this.datas.length;
        rowIndex < len;
        rowIndex++
      ) {
        // Ligne
        this.rowNumber = rowIndex;
        const row = this.datas[rowIndex];

        // Check le sexe
        const sexeCheck =
          row[CIVILITE].toUpperCase() === "H" ||
          row[CIVILITE].toUpperCase() === "F";

        this.countErrors(sexeCheck, rowIndex, CIVILITE);

        this.countErrors(notEmpty(row[NOM]), rowIndex, NOM);

        this.countErrors(notEmpty(row[PRENOM]), rowIndex, PRENOM);

        this.countErrors(
          this.isValidDate(row[DATE_NAISSANCE], true, false),
          rowIndex,
          DATE_NAISSANCE
        );

        this.countErrors(
          notEmpty(row[LIEU_NAISSANCE]),
          rowIndex,
          LIEU_NAISSANCE
        );

        this.countErrors(isValidEmail(row[EMAIL]), rowIndex, EMAIL);

        this.countErrors(isValidPhone(row[PHONE]), rowIndex, PHONE);

        this.countErrors(
          isValidValue(row[STATUT_DOM], "statut", true),
          rowIndex,
          STATUT_DOM
        );

        this.countErrors(
          isValidValue(row[TYPE_DOM], "demande", true),
          rowIndex,
          TYPE_DOM
        );

        this.countErrors(
          this.isValidDate(row[DATE_PREMIERE_DOM], false, false),
          rowIndex,
          DATE_PREMIERE_DOM
        );

        // SI Refus & Radié, on ne tient pas compte des dates suivantes : date de début, date de fin, date de dernier passage
        const dateIsRequired =
          row[STATUT_DOM] !== "REFUS" && row[STATUT_DOM] !== "RADIE";

        this.countErrors(
          this.isValidDate(row[DATE_DEBUT_DOM], dateIsRequired, false),
          rowIndex,
          DATE_DEBUT_DOM
        );

        this.countErrors(
          this.isValidDate(row[DATE_FIN_DOM], dateIsRequired, true),
          rowIndex,
          DATE_FIN_DOM
        );
        const dateDernierPassage = row[DATE_DERNIER_PASSAGE];

        this.countErrors(
          this.isValidDate(row[DATE_DERNIER_PASSAGE], dateIsRequired, false),
          rowIndex,
          DATE_DERNIER_PASSAGE
        );

        this.countErrors(
          isValidValue(row[MOTIF_REFUS], "motifRefus"),
          rowIndex,
          MOTIF_REFUS
        );

        this.countErrors(
          isValidValue(row[MOTIF_RADIATION], "motifRadiation"),
          rowIndex,
          MOTIF_RADIATION
        );

        this.countErrors(
          isValidValue(row[COMPOSITION_MENAGE], "menage"),
          rowIndex,
          COMPOSITION_MENAGE
        );

        this.countErrors(
          isValidValue(row[RAISON_DEMANDE], "raison"),
          rowIndex,
          RAISON_DEMANDE
        );

        this.countErrors(
          isValidValue(row[CAUSE_INSTABILITE], "cause"),
          rowIndex,
          CAUSE_INSTABILITE
        );

        this.countErrors(
          isValidValue(row[SITUATION_RESIDENTIELLE], "residence"),
          rowIndex,
          SITUATION_RESIDENTIELLE
        );

        this.countErrors(
          isValidValue(row[ORIENTATION], "choix"),
          rowIndex,
          ORIENTATION
        );

        this.countErrors(
          isValidValue(row[DOMICILIATION_EXISTANTE], "choix"),
          rowIndex,
          DOMICILIATION_EXISTANTE
        );

        this.countErrors(
          isValidValue(row[REVENUS], "choix"),
          rowIndex,
          REVENUS
        );

        this.countErrors(
          isValidValue(row[ACCOMPAGNEMENT], "choix"),
          rowIndex,
          ACCOMPAGNEMENT
        );

        for (const indexAyantDroit of AYANT_DROIT) {
          const nom = row[indexAyantDroit];
          const prenom = row[indexAyantDroit + 1];
          const dateNaissance = row[indexAyantDroit + 2];
          const lienParente = row[indexAyantDroit + 3];

          if (nom && prenom && dateNaissance && lienParente) {
            this.countErrors(notEmpty(nom), this.rowNumber, indexAyantDroit);

            this.countErrors(
              notEmpty(prenom),
              this.rowNumber,
              indexAyantDroit + 1
            );

            this.countErrors(
              this.isValidDate(dateNaissance, true, false),
              this.rowNumber,
              indexAyantDroit + 2
            );

            this.countErrors(
              isValidValue(lienParente, "lienParente", true),
              this.rowNumber,
              indexAyantDroit + 3
            );
          }
        }

        if (rowIndex + 1 >= this.datas.length) {
          if (this.errorsId.length > 0) {
            const error = {
              ids: JSON.stringify(this.errorsId),
              message: "IMPORT_ERRORS_BACKEND",
            };

            appLogger.error(`Import error for structure ${structureId}`, {
              sentry: true,
              extra: importContext,
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

          if (await this.saveDatas(this.datas, user)) {
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

  private countErrors(variable: boolean, idRow: number, idColumn: number) {
    const position = {
      row: idRow.toString(),
      column: this.columnsHeaders[idColumn],
      value: this.datas[idRow][idColumn],
    };

    if (variable !== true) {
      appLogger.warn(`[IMPORT]: Import Error `, {
        context: JSON.stringify(position),
        sentryBreadcrumb: true,
      });
      this.errorsId.push(position);
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

  // Vérification des différents champs Date
  public isValidDate(
    date: string,
    required: boolean,
    futureDate: boolean
  ): boolean {
    if (!notEmpty(date)) {
      return !required;
    }

    if (RegExp(regexp.date).test(date)) {
      const momentDate = moment.utc(date, "DD/MM/YYYY");
      if (momentDate.isValid()) {
        const dateToCheck = momentDate.startOf("day").toDate();

        const maxDate = futureDate
          ? // S'il s'agit d'une date dans le futur, on compare à N+1
            this.nextYear
          : this.today;

        const isValidDate =
          dateToCheck >= this.minDate && dateToCheck <= maxDate;

        if (!isValidDate) {
          appLogger.warn(`Invalid date`, {
            sentryBreadcrumb: true,
            extra: {
              date,
              dateToCheck,
              maxDate,
            },
          });
        }
        return isValidDate;
      }
    }
    return false;
  }
}
