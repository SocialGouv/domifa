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
import { StructuresService } from "../../structures/services/structures.service";
import { appLogger } from "../../util";
import { ExpressResponse } from "../../util/express";
import { randomName, validateUpload } from "../../util/FileManager";
import { AppAuthUser } from "../../_common/model";
import { Entretien } from "../interfaces/entretien";
import { Usager } from "../interfaces/usagers";
import { UsagersService } from "../services/usagers.service";

import moment = require("moment");

export const regexp = {
  date: /^([0-9]|[0-2][0-9]|(3)[0-1])(\/)(([0-9]|(0)[0-9])|((1)[0-2]))(\/)\d{4}$/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // tslint:disable max-line-length
  phone: /^((\+)33|0)[1-9](\d{2}){4}$/,
};

type AOA = any[][];

@UseGuards(AuthGuard("jwt"), FacteurGuard)
@ApiTags("import")
@ApiBearerAuth()
@Controller("import")
export class ImportController {
  public colNames: string[];

  public CUSTOM_ID = 0;
  public CIVILITE = 1;
  public NOM = 2;
  public PRENOM = 3;
  public SURNOM = 4;
  public DATE_NAISSANCE = 5;
  public LIEU_NAISSANCE = 6;
  public PHONE = 7;
  public EMAIL = 8;
  public STATUT_DOM = 9;
  public MOTIF_REFUS = 10;
  public MOTIF_RADIATION = 11;
  public TYPE_DOM = 12;
  public DATE_DEBUT_DOM = 13;
  public DATE_FIN_DOM = 14;
  public DATE_PREMIERE_DOM = 15;
  public DATE_DERNIER_PASSAGE = 16;

  public ORIENTATION = 17;
  public ORIENTATION_DETAILS = 18;
  public DOMICILIATION_EXISTANTE = 19;
  public REVENUS = 20;
  public REVENUS_DETAILS = 21;
  public LIEN_COMMUNE = 22;

  public COMPOSITION_MENAGE = 23;
  public SITUATION_RESIDENTIELLE = 24;
  public SITUATION_DETAILS = 25;

  public CAUSE_INSTABILITE = 26;
  public CAUSE_DETAILS = 27;

  public RAISON_DEMANDE = 28;
  public RAISON_DEMANDE_DETAILS = 29;

  public ACCOMPAGNEMENT = 30;
  public ACCOMPAGNEMENT_DETAILS = 31;
  public COMMENTAIRES = 32;

  public AYANT_DROIT = [33, 37, 41, 45, 49, 53, 57, 61, 65];

  private readonly logger = new Logger(ImportController.name);

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
          row[this.CIVILITE].toUpperCase() === "H" ||
          row[this.CIVILITE].toUpperCase() === "F";

        this.countErrors(sexeCheck, rowIndex, this.CIVILITE, datas, errorsId);

        this.countErrors(
          this.notEmpty(row[this.NOM]),
          rowIndex,
          this.NOM,
          datas,
          errorsId
        );

        this.countErrors(
          this.notEmpty(row[this.PRENOM]),
          rowIndex,
          this.PRENOM,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidDate(row[this.DATE_NAISSANCE], {
            required: true,
            minDate,
            maxDate: today,
          }),
          rowIndex,
          this.DATE_NAISSANCE,
          datas,
          errorsId
        );

        this.countErrors(
          this.notEmpty(row[this.LIEU_NAISSANCE]),
          rowIndex,
          this.LIEU_NAISSANCE,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidEmail(row[this.EMAIL]),
          rowIndex,
          this.EMAIL,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidPhone(row[this.PHONE]),
          rowIndex,
          this.PHONE,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.STATUT_DOM], "statut", true),
          rowIndex,
          this.STATUT_DOM,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.TYPE_DOM], "demande", true),
          rowIndex,
          this.TYPE_DOM,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidDate(row[this.DATE_PREMIERE_DOM], {
            required: false,
            minDate,
            maxDate: today,
          }),
          rowIndex,
          this.DATE_PREMIERE_DOM,
          datas,
          errorsId
        );

        // SI Refus & Radié, on ne tient pas compte des dates suivantes : date de début, date de fin, date de dernier passage
        const dateIsRequired =
          row[this.STATUT_DOM] !== "REFUS" && row[this.STATUT_DOM] !== "RADIE";

        this.countErrors(
          this.isValidDate(row[this.DATE_DEBUT_DOM], {
            required: dateIsRequired,
            minDate,
            maxDate: today,
          }),
          rowIndex,
          this.DATE_DEBUT_DOM,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidDate(row[this.DATE_FIN_DOM], {
            required: dateIsRequired,
            minDate,
            maxDate: nextYear,
          }),
          rowIndex,
          this.DATE_FIN_DOM,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidDate(row[this.DATE_DERNIER_PASSAGE], {
            required: false,
            minDate,
            maxDate: today,
          }),
          rowIndex,
          this.DATE_DERNIER_PASSAGE,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.MOTIF_REFUS], "motifRefus"),
          rowIndex,
          this.MOTIF_REFUS,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.MOTIF_RADIATION], "motifRadiation"),
          rowIndex,
          this.MOTIF_RADIATION,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.COMPOSITION_MENAGE], "menage"),
          rowIndex,
          this.COMPOSITION_MENAGE,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.RAISON_DEMANDE], "raison"),
          rowIndex,
          this.RAISON_DEMANDE,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.CAUSE_INSTABILITE], "cause"),
          rowIndex,
          this.CAUSE_INSTABILITE,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.SITUATION_RESIDENTIELLE], "residence"),
          rowIndex,
          this.SITUATION_RESIDENTIELLE,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.ORIENTATION], "choix"),
          rowIndex,
          this.ORIENTATION,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.DOMICILIATION_EXISTANTE], "choix"),
          rowIndex,
          this.DOMICILIATION_EXISTANTE,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.REVENUS], "choix"),
          rowIndex,
          this.REVENUS,
          datas,
          errorsId
        );

        this.countErrors(
          this.isValidValue(row[this.ACCOMPAGNEMENT], "choix"),
          rowIndex,
          this.ACCOMPAGNEMENT,
          datas,
          errorsId
        );

        for (const indexAyantDroit of this.AYANT_DROIT) {
          const nom = row[indexAyantDroit];
          const prenom = row[indexAyantDroit + 1];
          const dateNaissance = row[indexAyantDroit + 2];
          const lienParente = row[indexAyantDroit + 3];

          if (nom && prenom && dateNaissance && lienParente) {
            this.countErrors(
              this.notEmpty(nom),
              rowNumber,
              indexAyantDroit,
              datas,
              errorsId
            );

            this.countErrors(
              this.notEmpty(prenom),
              rowNumber,
              indexAyantDroit + 1,
              datas,
              errorsId
            );

            this.countErrors(
              this.isValidDate(dateNaissance, {
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
              this.isValidValue(lienParente, "lienParente", true),
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
                errorsId: errorsId,
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
    const usagers: Usager[] = [];

    for (let rowIndex = 1, len = datas.length; rowIndex < len; rowIndex++) {
      // Ligne du fichier
      const row = datas[rowIndex];

      // Infos générales
      const sexe = row[this.CIVILITE] === "H" ? "homme" : "femme";
      let motif = "";

      // Tableaux d'ayant-droit & historique
      const ayantsDroits = [];
      const historique = [];

      //
      //
      // Partie STATUT + HISTORIQUE
      //
      let datePremiereDom = now;
      let dateDecision = this.notEmpty(row[this.DATE_DEBUT_DOM])
        ? this.convertDate(row[this.DATE_DEBUT_DOM])
        : now;

      if (this.notEmpty(row[this.DATE_PREMIERE_DOM])) {
        datePremiereDom = this.convertDate(row[this.DATE_PREMIERE_DOM]);

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
      } else if (this.notEmpty(row[this.DATE_DEBUT_DOM])) {
        datePremiereDom = this.convertDate(row[this.DATE_DEBUT_DOM]);
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

      const customId = this.notEmpty(row[this.CUSTOM_ID])
        ? row[this.CUSTOM_ID]
        : null;

      const phone = this.notEmpty(row[this.PHONE])
        ? row[this.PHONE].replace(/\D/g, "")
        : null;

      const email = this.notEmpty(row[this.EMAIL]) ? row[this.EMAIL] : null;

      //
      // Dates
      //
      const dernierPassage = this.notEmpty(row[this.DATE_DERNIER_PASSAGE])
        ? this.convertDate(row[this.DATE_DERNIER_PASSAGE])
        : now;

      let dateDebut = this.notEmpty(row[this.DATE_DEBUT_DOM])
        ? this.convertDate(row[this.DATE_DEBUT_DOM])
        : null;

      const dateFin = this.notEmpty(row[this.DATE_FIN_DOM])
        ? this.convertDate(row[this.DATE_FIN_DOM])
        : null;

      if (row[this.STATUT_DOM] === "REFUS") {
        motif = this.notEmpty(row[this.MOTIF_REFUS])
          ? row[this.MOTIF_REFUS].toUpperCase()
          : "AUTRE";

        dateDebut = this.convertDate(row[this.DATE_FIN_DOM]);
        dateDecision = this.convertDate(row[this.DATE_FIN_DOM]);
      }

      if (row[this.STATUT_DOM] === "RADIE") {
        dateDecision = this.notEmpty(row[this.DATE_FIN_DOM])
          ? this.convertDate(row[this.DATE_FIN_DOM])
          : now;

        motif = this.notEmpty(row[this.MOTIF_RADIATION])
          ? row[this.MOTIF_RADIATION].toUpperCase()
          : "AUTRE";
      }

      //
      // Partie ENTRETIEN
      //
      const entretien: Entretien = {};

      if (this.notEmpty(row[this.COMPOSITION_MENAGE])) {
        entretien.typeMenage = row[this.COMPOSITION_MENAGE].toUpperCase();
      }

      if (this.notEmpty(row[this.DOMICILIATION_EXISTANTE])) {
        entretien.domiciliation = this.convertChoix(
          row[this.DOMICILIATION_EXISTANTE]
        );
      }

      if (this.notEmpty(row[this.ACCOMPAGNEMENT])) {
        entretien.accompagnement = this.convertChoix(row[this.ACCOMPAGNEMENT]);

        if (
          this.notEmpty(row[this.ACCOMPAGNEMENT_DETAILS]) &&
          row[this.ACCOMPAGNEMENT] === "OUI"
        ) {
          entretien.accompagnementDetail = row[this.ACCOMPAGNEMENT_DETAILS];
        }
      }

      if (this.notEmpty(row[this.REVENUS])) {
        entretien.revenus = this.convertChoix(row[this.REVENUS]);
        if (
          this.notEmpty(row[this.REVENUS_DETAILS]) &&
          row[this.REVENUS] === "OUI"
        ) {
          entretien.revenusDetail = row[this.REVENUS_DETAILS];
        }
      }

      if (this.notEmpty(row[this.ORIENTATION])) {
        entretien.orientation = this.convertChoix(row[this.ORIENTATION]);

        if (
          this.notEmpty(row[this.ORIENTATION_DETAILS]) &&
          row[this.ORIENTATION] === "OUI"
        ) {
          entretien.orientationDetail = row[this.ORIENTATION_DETAILS];
        }
      }

      if (this.notEmpty(row[this.RAISON_DEMANDE])) {
        entretien.raison = row[this.RAISON_DEMANDE].toUpperCase();
      }

      if (this.notEmpty(row[this.RAISON_DEMANDE_DETAILS])) {
        entretien.raisonDetail = row[this.RAISON_DEMANDE_DETAILS];
      }

      if (this.notEmpty(row[this.LIEN_COMMUNE])) {
        entretien.liencommune = row[this.LIEN_COMMUNE];
      }

      if (this.notEmpty(row[this.SITUATION_RESIDENTIELLE])) {
        entretien.residence = row[this.SITUATION_RESIDENTIELLE].toUpperCase();
      }

      if (this.notEmpty(row[this.SITUATION_DETAILS])) {
        entretien.residenceDetail = row[this.SITUATION_DETAILS];
      }

      if (this.notEmpty(row[this.CAUSE_INSTABILITE])) {
        entretien.cause = row[this.CAUSE_INSTABILITE].toUpperCase();
      }

      if (this.notEmpty(row[this.CAUSE_DETAILS])) {
        entretien.causeDetail = row[this.CAUSE_DETAILS];
      }

      if (this.notEmpty(row[this.COMMENTAIRES])) {
        entretien.commentaires = row[this.COMMENTAIRES];
      }

      //
      // AYANT-DROIT
      //
      for (const indexAyantDroit of this.AYANT_DROIT) {
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
      const usager = {
        ayantsDroits,
        customId,
        dateNaissance: this.convertDate(row[this.DATE_NAISSANCE]),
        datePremiereDom,
        decision: {
          dateDebut,
          dateDecision,
          dateFin,
          motif: motif.trim().toUpperCase(),
          motifDetails: "",
          statut: row[this.STATUT_DOM].trim().toUpperCase(),
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
        nom: row[this.NOM],
        phone,
        prenom: row[this.PRENOM],
        sexe,
        structureId: user.structureId,
        surnom: row[this.SURNOM],
        typeDom: row[this.TYPE_DOM].toUpperCase(),
        villeNaissance: row[this.LIEU_NAISSANCE],
      };

      usagers.push(await this.usagersService.save(usager, user));

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

  private notEmpty(value: string): boolean {
    return (
      typeof value !== "undefined" && value !== null && value.trim() !== ""
    );
  }

  // Vérification des différents champs Date
  public isValidDate(
    date: string,
    {
      required,
      minDate,
      maxDate,
    }: {
      required: boolean;
      minDate: Date;
      maxDate: Date;
    }
  ): boolean {
    if (!this.notEmpty(date)) {
      return !required;
    }

    if (RegExp(regexp.date).test(date)) {
      const momentDate = moment.utc(date, "DD/MM/YYYY");
      if (momentDate.isValid()) {
        const dateToCheck = momentDate.startOf("day").toDate();

        const isValidDate = dateToCheck >= minDate && dateToCheck <= maxDate;
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

  private isValidPhone(phone: string): boolean {
    const isValid = !this.notEmpty(phone)
      ? true
      : RegExp(regexp.phone).test(phone.replace(/\D/g, ""));
    if (!isValid) {
      appLogger.warn(`Invalid phone`, {
        sentryBreadcrumb: true,
        extra: {
          phone,
        },
      });
    }
    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const isValid = !this.notEmpty(email)
      ? true
      : RegExp(regexp.email).test(email);
    if (!isValid) {
      appLogger.warn(`Invalid email`, {
        sentryBreadcrumb: true,
        extra: {
          email,
        },
      });
    }
    return isValid;
  }

  private isValidValue(
    data: string,
    rowName: string,
    required: boolean = false
  ): boolean {
    if (!this.notEmpty(data)) {
      return !required;
    }

    const types: any = {
      demande: ["PREMIERE", "RENOUVELLEMENT"],
      lienParente: ["ENFANT", "CONJOINT", "PARENT", "AUTRE"],
      menage: [
        "HOMME_ISOLE_SANS_ENFANT",
        "FEMME_ISOLE_SANS_ENFANT",
        "HOMME_ISOLE_AVEC_ENFANT",
        "FEMME_ISOLE_AVEC_ENFANT",
        "COUPLE_SANS_ENFANT",
        "COUPLE_AVEC_ENFANT",
      ],
      motifRadiation: [
        "NON_MANIFESTATION_3_MOIS",
        "A_SA_DEMANDE",
        "ENTREE_LOGEMENT",
        "FIN_DE_DOMICILIATION",
        "PLUS_DE_LIEN_COMMUNE",
        "NON_RESPECT_REGLEMENT",
        "AUTRE",
      ],
      motifRefus: ["LIEN_COMMUNE", "SATURATION", "HORS_AGREMENT", "AUTRE"],
      residence: [
        "DOMICILE_MOBILE",
        "HEBERGEMENT_SOCIAL",
        "HEBERGEMENT_TIERS",
        "HOTEL",
        "SANS_ABRI",
        "AUTRE",
      ],
      cause: [
        "ERRANCE",
        "AUTRE",
        "EXPULSION",
        "HEBERGE_SANS_ADRESSE",
        "ITINERANT",
        "RUPTURE",
        "SORTIE_STRUCTURE",
        "VIOLENCE",
      ],
      statut: ["VALIDE", "REFUS", "RADIE"],
      raison: ["EXERCICE_DROITS", "PRESTATIONS_SOCIALES", "AUTRE"],
      choix: ["OUI", "NON"],
    };

    const isValid = types[rowName].indexOf(data.toUpperCase()) > -1;
    if (!isValid) {
      appLogger.warn(`Invalid value`, {
        sentryBreadcrumb: true,
        extra: {
          data,
          rowName,
          required,
        },
      });
    }
    return isValid;
  }
}
