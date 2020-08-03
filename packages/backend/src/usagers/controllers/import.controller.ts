import {
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import * as fs from "fs";
import * as XLSX from "xlsx";
import * as path from "path";

import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { AuthGuard } from "@nestjs/passport";

import { CurrentUser } from "../../auth/current-user.decorator";

import { StructuresService } from "../../structures/structures.service";
import { UsagersService } from "../services/usagers.service";

import { User } from "../../users/user.interface";
import { Entretien } from "../interfaces/entretien";

export const regexp = {
  date: /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // tslint:disable max-line-length
  phone: /^((\+)33|0)[1-9](\d{2}){4}$/,
};

type AOA = any[][];

@UseGuards(AuthGuard("jwt"))
@Controller("import")
export class ImportController {
  public errorsId: string[];
  public colNames: string[];
  public rowNumber: number;
  public datas: AOA = [[], []];

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
    this.errorsId = [];
    this.rowNumber = 0;
    this.datas = [[], []];

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
      fileFilter: (req: any, file: any, cb: any) => {
        if (
          file.mimetype !==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
          "application/vnd.oasis.opendocument.spreadsheet" &&
          file.mimetype !== "application/vnd.ms-excel"
        ) {
          throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const dir = path.resolve(__dirname, "../../imports/");
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },

        filename: (req: any, file: any, cb: any) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${path.extname(file.originalname)}`);
        },
      }),
    })
  )
  public async importExcel(
    @Response() res: any,
    @UploadedFile() file: any,
    @CurrentUser() user: User
  ) {
    const dir = path.resolve(__dirname, "../../imports/");
    const buffer = fs.readFileSync(dir + "/" + file.filename);
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

      for (let index = 1, len = this.datas.length; index < len; index++) {
        this.rowNumber = index;
        const row = this.datas[index];
        const sexeCheck =
          row[this.CIVILITE] === "H" || row[this.CIVILITE] === "F";

        this.countErrors(sexeCheck, index, this.CIVILITE);

        this.countErrors(this.notEmpty(row[this.NOM]), index, this.NOM);

        this.countErrors(this.notEmpty(row[this.PRENOM]), index, this.PRENOM);

        this.countErrors(
          this.validDate(row[this.DATE_NAISSANCE], true, false),
          index,
          this.DATE_NAISSANCE
        );

        this.countErrors(
          this.notEmpty(row[this.LIEU_NAISSANCE]),
          index,
          this.LIEU_NAISSANCE
        );

        this.countErrors(this.validEmail(row[this.EMAIL]), index, this.EMAIL);

        this.countErrors(this.validPhone(row[this.PHONE]), index, this.PHONE);

        this.countErrors(
          this.isValidValue(row[this.STATUT_DOM], "statut", true),
          index,
          this.STATUT_DOM
        );

        this.countErrors(
          this.isValidValue(row[this.TYPE_DOM], "demande", true),
          index,
          this.TYPE_DOM
        );

        this.countErrors(
          this.validDate(row[this.DATE_DEBUT_DOM], true, false),
          index,
          this.DATE_DEBUT_DOM
        );

        this.countErrors(
          this.validDate(row[this.DATE_FIN_DOM], true, true),
          index,
          this.DATE_FIN_DOM
        );

        this.countErrors(
          this.validDate(row[this.DATE_PREMIERE_DOM], false, false),
          index,
          this.DATE_PREMIERE_DOM
        );

        this.countErrors(
          this.validDate(row[this.DATE_DERNIER_PASSAGE], false, false),
          index,
          this.DATE_DERNIER_PASSAGE
        );

        this.countErrors(
          this.isValidValue(row[this.MOTIF_REFUS], "motifRefus"),
          index,
          this.MOTIF_REFUS
        );

        this.countErrors(
          this.isValidValue(row[this.MOTIF_RADIATION], "motifRadiation"),
          index,
          this.MOTIF_RADIATION
        );

        this.countErrors(
          this.isValidValue(row[this.COMPOSITION_MENAGE], "menage"),
          index,
          this.COMPOSITION_MENAGE
        );

        this.countErrors(
          this.isValidValue(row[this.RAISON_DEMANDE], "raison"),
          index,
          this.RAISON_DEMANDE
        );

        this.countErrors(
          this.isValidValue(row[this.CAUSE_INSTABILITE], "cause"),
          index,
          this.CAUSE_INSTABILITE
        );

        this.countErrors(
          this.isValidValue(row[this.SITUATION_RESIDENTIELLE], "residence"),
          index,
          this.SITUATION_RESIDENTIELLE
        );

        this.countErrors(
          this.isValidValue(row[this.ORIENTATION], "choix"),
          index,
          this.ORIENTATION
        );

        this.countErrors(
          this.isValidValue(row[this.DOMICILIATION_EXISTANTE], "choix"),
          index,
          this.DOMICILIATION_EXISTANTE
        );

        this.countErrors(
          this.isValidValue(row[this.REVENUS], "choix"),
          index,
          this.REVENUS
        );

        this.countErrors(
          this.isValidValue(row[this.ACCOMPAGNEMENT], "choix"),
          index,
          this.ACCOMPAGNEMENT
        );

        for (const indexAD of this.AYANT_DROIT) {
          const nom = row[indexAD];
          const prenom = row[indexAD + 1];
          const dateNaissance = row[indexAD + 2];
          const lienParente = row[indexAD + 3];

          if (nom && prenom && dateNaissance && lienParente) {
            this.countErrors(this.notEmpty(nom), this.rowNumber, indexAD);

            this.countErrors(
              this.notEmpty(prenom),
              this.rowNumber,
              indexAD + 1
            );

            this.countErrors(
              this.validDate(dateNaissance, true, false),
              this.rowNumber,
              indexAD + 2
            );

            this.countErrors(
              this.isValidValue(lienParente, "lienParente", true),
              this.rowNumber,
              indexAD + 3
            );
          }
        }

        if (index + 1 >= this.datas.length) {
          if (this.errorsId.length > 0) {
            const error = {
              ids: JSON.stringify(this.errorsId),
              message: "IMPORT_ERRORS_BACKEND",
            };
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

  public async saveDatas(datas: any, @CurrentUser() user: User) {
    const agent = user.prenom + " " + user.nom;
    const usagers = [];
    for (let index = 1, len = datas.length; index < len; index++) {
      const row = datas[index];
      const ayantsDroits = [];
      const historique = [];
      const sexe = row[this.CIVILITE] === "H" ? "homme" : "femme";
      let motif = "";

      let dateDecision = this.notEmpty(row[this.DATE_DEBUT_DOM])
        ? this.convertDate(row[this.DATE_DEBUT_DOM])
        : new Date();

      let datePremiereDom = new Date().toISOString();

      if (this.notEmpty(row[this.DATE_PREMIERE_DOM])) {
        datePremiereDom = this.convertDate(row[this.DATE_PREMIERE_DOM]);

        const dateFinPremiereDom = new Date(datePremiereDom);
        dateFinPremiereDom.setFullYear(
          dateFinPremiereDom.setFullYear(dateFinPremiereDom.getFullYear() + 1)
        );

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
        dateDebut: new Date(),
        dateDecision: new Date(),
        dateFin: new Date(),
        motif,
        statut: "IMPORT",
        userId: user.id,
        userName: agent,
      });

      for (const indexAD of this.AYANT_DROIT) {
        const nom = row[indexAD];
        const prenom = row[indexAD + 1];
        const dateNaissance = row[indexAD + 2];
        let lienParente = row[indexAD + 3];

        if (lienParente === "AUTRES") {
          lienParente = "AUTRE";
        }

        if (nom && prenom && dateNaissance && lienParente) {
          ayantsDroits.push({
            nom,
            prenom,
            dateNaissance,
            lien: lienParente.toString().toUpperCase(),
          });
        }
      }

      if (motif === "AUTRES") {
        motif = "AUTRE";
      }

      const phone = !row[this.PHONE]
        ? null
        : row[this.PHONE].replace(/\D/g, "");

      const dernierPassage = this.notEmpty(row[this.DATE_DERNIER_PASSAGE])
        ? this.convertDate(row[this.DATE_DERNIER_PASSAGE])
        : new Date();

      let dateDebut = this.notEmpty(row[this.DATE_DEBUT_DOM])
        ? this.convertDate(row[this.DATE_DEBUT_DOM])
        : null;

      const dateFin = this.notEmpty(row[this.DATE_FIN_DOM])
        ? this.convertDate(row[this.DATE_FIN_DOM])
        : null;

      const customId = this.notEmpty(row[this.CUSTOM_ID])
        ? row[this.CUSTOM_ID]
        : null;

      const entretien: Entretien = {};

      if (row[this.STATUT_DOM] === "REFUS") {
        motif = this.notEmpty(row[this.MOTIF_REFUS])
          ? row[this.MOTIF_REFUS]
          : "AUTRE";

        dateDebut = this.convertDate(row[this.DATE_FIN_DOM]);
        dateDecision = this.convertDate(row[this.DATE_FIN_DOM]);
      }

      if (row[this.STATUT_DOM] === "RADIE") {
        dateDecision = this.notEmpty(row[this.DATE_FIN_DOM])
          ? this.convertDate(row[this.DATE_FIN_DOM])
          : new Date();

        motif = this.notEmpty(row[this.MOTIF_RADIATION])
          ? row[this.MOTIF_RADIATION]
          : "AUTRE";
      }

      if (this.notEmpty(row[this.COMPOSITION_MENAGE])) {
        entretien.typeMenage = row[this.COMPOSITION_MENAGE];
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
        entretien.raison = row[this.RAISON_DEMANDE];
      }

      if (this.notEmpty(row[this.RAISON_DEMANDE_DETAILS])) {
        entretien.raisonDetail = row[this.RAISON_DEMANDE_DETAILS];
      }

      if (this.notEmpty(row[this.LIEN_COMMUNE])) {
        entretien.liencommune = row[this.LIEN_COMMUNE];
      }

      if (this.notEmpty(row[this.SITUATION_RESIDENTIELLE])) {
        entretien.residence = row[this.SITUATION_RESIDENTIELLE];
      }

      if (this.notEmpty(row[this.SITUATION_DETAILS])) {
        entretien.residenceDetail = row[this.SITUATION_DETAILS];
      }

      if (this.notEmpty(row[this.CAUSE_INSTABILITE])) {
        entretien.cause = row[this.CAUSE_INSTABILITE];
      }

      if (this.notEmpty(row[this.CAUSE_DETAILS])) {
        entretien.causeDetail = row[this.CAUSE_DETAILS];
      }

      if (this.notEmpty(row[this.COMMENTAIRES])) {
        entretien.commentaires = row[this.COMMENTAIRES];
      }

      const usager = {
        ayantsDroits,
        customId,
        dateNaissance: this.convertDate(row[this.DATE_NAISSANCE]),
        datePremiereDom,
        decision: {
          agent,
          dateDebut,
          dateDecision,
          dateFin,
          motif,
          motifDetails: "",
          statut: row[this.STATUT_DOM],
          userId: user.id,
          userName: agent,
        },
        lastInteraction: {
          dateInteraction: dernierPassage,
        },
        email: row[this.EMAIL],
        entretien,
        etapeDemande: 5,
        historique,
        nom: row[this.NOM],
        phone,
        prenom: row[this.PRENOM],
        sexe,
        structureId: user.structureId,
        surnom: row[this.SURNOM],
        typeDom: row[this.TYPE_DOM],
        villeNaissance: row[this.LIEU_NAISSANCE],
      };

      usagers.push(await this.usagersService.save(usager, user));

      if (index + 1 >= datas.length) {
        return true;
      }
    }
  }

  private convertChoix(value: any) {
    return value === "OUI" ? true : false;
  }

  private convertDate(dateFr: string) {
    const dateParts = dateFr.split("/");
    const dateEn = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    const newDate = new Date(dateEn).toISOString();
    return newDate;
  }

  private countErrors(variable: boolean, idRow: any, idColumn: number) {
    const position =
      "Ligne " +
      idRow.toString() +
      ":  --" +
      this.datas[idRow][idColumn] +
      "-- " +
      this.colNames[idColumn] +
      " - Retour :  " +
      variable;

    if (
      (this.datas[idRow][this.STATUT_DOM] === "REFUS" ||
        this.datas[idRow][this.STATUT_DOM] === "RADIE") &&
      (idColumn === this.DATE_DEBUT_DOM ||
        idColumn === this.DATE_PREMIERE_DOM ||
        idColumn === this.DATE_DERNIER_PASSAGE)
    ) {
      variable = true;
      return true;
    }

    if (variable !== true) {
      this.errorsId.push(position);
    }
    return variable;
  }

  private notEmpty(value: string): boolean {
    return (
      typeof value !== "undefined" && value !== null && value.trim() !== ""
    );
  }

  public validDate(
    date: string,
    required: boolean,
    futureDate?: boolean
  ): boolean {
    if (
      (typeof date === "undefined" || date === null || date === "") &&
      !required
    ) {
      return true;
    }

    if (RegExp(regexp.date).test(date)) {
      const today = new Date();
      const maxAnnee = futureDate
        ? today.getFullYear() + 1
        : today.getFullYear();

      const dateParts = date.split("/");
      const jour = parseInt(dateParts[0], 10);
      const mois = parseInt(dateParts[1], 10);
      const annee = parseInt(dateParts[2], 10);

      const isValidFormat =
        jour <= 31 &&
        jour > 0 &&
        mois <= 12 &&
        mois > 0 &&
        annee > 1900 &&
        annee <= maxAnnee;

      if (!isValidFormat) return false;

      const dateToCheck = new Date(annee, mois - 1, jour);

      return futureDate || dateToCheck <= today;
    }
    return false;
  }

  private validPhone(phone: string): boolean {
    if (!phone || phone === null || phone === "") {
      return true;
    }
    return RegExp(regexp.phone).test(phone.replace(/\D/g, ""));
  }

  private validEmail(email: string): boolean {
    if (!email || email === null || email === "") {
      return true;
    }
    return RegExp(regexp.email).test(email);
  }

  private isValidValue(data: string, rowName: string, required?: boolean) {
    if ((data === undefined || data === null || data === "") && !required) {
      return true;
    }

    if ((data === undefined || data === null || data === "") && required) {
      return false;
    }

    const types: any = {
      demande: ["PREMIERE", "RENOUVELLEMENT"],
      lienParente: ["ENFANT", "CONJOINT", "PARENT", "AUTRE", "AUTRES"],
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
        "AUTRES",
      ],
      motifRefus: [
        "LIEN_COMMUNE",
        "SATURATION",
        "HORS_AGREMENT",
        "AUTRE",
        "AUTRES",
      ],
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

    return types[rowName].indexOf(data.toUpperCase()) > -1;
  }
}
