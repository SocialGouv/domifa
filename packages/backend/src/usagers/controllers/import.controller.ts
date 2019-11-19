import {
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import * as XLSX from "xlsx";
import { StructuresService } from "../../structures/structures.service";
import { CurrentUser } from "../../users/current-user.decorator";
import { UsersService } from "../../users/services/users.service";
import { User } from "../../users/user.interface";
import { UsagersService } from "../services/usagers.service";

export const regexp = {
  date: /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // tslint:disable max-line-length
  phone: /^((\+)33|0)[1-9](\d{2}){4}$/,
  postcode: /^[0-9][0-9AB][0-9]{3}$/
};

export const CIVILITE = 0;
export const NOM = 1;
export const PRENOM = 2;
export const SURNOM = 3;
export const DATE_NAISSANCE = 4;
export const LIEU_NAISSANCE = 5;
export const EMAIL = 6;
export const PHONE = 7;
export const STATUT_DOM = 8;
export const TYPE_DOM = 9;
export const DATE_DEBUT_DOM = 10;
export const DATE_FIN_DOM = 11;
export const DATE_PREMIERE_DOM = 12;
export const MOTIF_REFUS = 13;
export const MOTIF_RADIATION = 14;
export const MENAGE = 15;
export const AYANT_DROIT = [16, 20, 24, 28];

type AOA = any[][];

@UseGuards(AuthGuard("jwt"))
@Controller("import")
export class ImportController {
  public errorsId: string[];
  public rowNumber: number;
  private readonly logger = new Logger(ImportController.name);

  constructor(
    private readonly usagersService: UsagersService,
    private readonly usersService: UsersService,
    private readonly structureService: StructuresService
  ) {
    this.errorsId = [];
    this.rowNumber = 0;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const dir = path.resolve(__dirname, "../../imports/");
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        fileFilter: (req: any, file: any, cb: any) => {
          if (file.mimetype !== "xlsx" && file.mimetype !== "xls") {
            throw new HttpException("INCORRECT_FORMAT", HttpStatus.BAD_REQUEST);
          }
          cb(null, true);
        },
        filename: (req: any, file: any, cb: any) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${path.extname(file.originalname)}`);
        }
      })
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
      type: "buffer"
    });

    if (!buffer) {
      return false;
    } else {
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const datas = XLSX.utils.sheet_to_json(ws, {
        blankrows: false,
        dateNF: "dd/mm/yyyy",
        header: 1,
        raw: false
      }) as AOA;

      for (let index = 1, len = datas.length; index < len; index++) {
        this.rowNumber = index;
        const row = datas[index];
        const sexeCheck = row[CIVILITE] === "H" || row[CIVILITE] === "F";

        this.countErrors(sexeCheck, index, CIVILITE);
        this.countErrors(this.notEmpty(row[NOM]), index, NOM);
        this.countErrors(this.notEmpty(row[PRENOM]), index, PRENOM);
        this.countErrors(
          this.validDate(row[DATE_NAISSANCE], true),
          index,
          DATE_NAISSANCE
        );
        this.countErrors(
          this.notEmpty(row[LIEU_NAISSANCE]),
          index,
          LIEU_NAISSANCE
        );
        this.countErrors(this.validEmail(row[EMAIL]), index, EMAIL);
        this.countErrors(this.validPhone(row[PHONE]), index, PHONE);

        this.countErrors(
          this.isValidValue(row[STATUT_DOM], "statut", true),
          index,
          STATUT_DOM
        );

        this.countErrors(
          this.isValidValue(row[TYPE_DOM], "demande", true),
          index,
          TYPE_DOM
        );
        this.countErrors(
          this.validDate(row[DATE_PREMIERE_DOM], false),
          index,
          DATE_PREMIERE_DOM
        );
        this.countErrors(
          this.validDate(row[DATE_FIN_DOM], true),
          index,
          DATE_FIN_DOM
        );
        this.countErrors(
          this.validDate(row[DATE_PREMIERE_DOM], false),
          index,
          DATE_PREMIERE_DOM
        );
        this.countErrors(
          this.isValidValue(row[MOTIF_REFUS], "motifRefus"),
          index,
          MOTIF_REFUS
        );
        this.countErrors(
          this.isValidValue(row[MOTIF_RADIATION], "motifRadiation"),
          index,
          MOTIF_RADIATION
        );
        this.countErrors(this.isValidValue(row[15], "menage"), index, 15);

        for (const indexAD of AYANT_DROIT) {
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
              this.validDate(dateNaissance, true),
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

        if (index + 1 >= datas.length) {
          this.logger.log("FIN DU FICHIER");
          if (this.errorsId.length > 0) {
            this.logger.log("Erreurs -> " + this.errorsId.length);
            return res.status(HttpStatus.NOT_ACCEPTABLE).json({
              errorsNbre: this.errorsId.length,
              message: "ERRORS_IN_FILE"
            });
          }

          try {
            fs.unlinkSync(dir + "/" + file.filename);
          } catch (err) {
            throw new HttpException(
              "Impossible de supprimer le fichier",
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

  public async saveDatas(datas: any, @CurrentUser() user: User) {
    const agent = user.prenom + " " + user.nom;
    const usagers = [];

    for (let index = 1, len = datas.length; index < len; index++) {
      const row = datas[index];
      const ayantsDroits = [];

      let motif = "";

      let dateDecision = this.notEmpty(row[DATE_DEBUT_DOM])
        ? this.convertDate(row[DATE_DEBUT_DOM])
        : new Date();

      let datePremiereDom = new Date().toISOString();
      if (this.notEmpty(row[DATE_PREMIERE_DOM])) {
        datePremiereDom = this.convertDate(row[DATE_PREMIERE_DOM]);
      } else if (!this.notEmpty(row[DATE_DEBUT_DOM])) {
        datePremiereDom = this.convertDate(row[DATE_DEBUT_DOM]);
      }

      const sexe = row[CIVILITE] === "H" ? "homme" : "femme";

      if (row[STATUT_DOM] === "REFUS") {
        motif = this.notEmpty(row[MOTIF_REFUS]) ? row[MOTIF_REFUS] : "AUTRE";
      }

      if (row[STATUT_DOM] === "RADIE") {
        dateDecision = this.notEmpty(row[DATE_FIN_DOM])
          ? this.convertDate(row[DATE_FIN_DOM])
          : new Date();
        motif = this.notEmpty(row[MOTIF_RADIATION])
          ? row[MOTIF_RADIATION]
          : "AUTRE";
      }

      for (const indexAD of AYANT_DROIT) {
        const nom = row[indexAD];
        const prenom = row[indexAD + 1];
        const dateNaissance = row[indexAD + 2];
        const lienParente = row[indexAD + 3];

        if (nom && prenom && dateNaissance && lienParente) {
          ayantsDroits.push({ nom, prenom, dateNaissance, lien: lienParente });
        }
      }

      const usager = {
        agent,
        ayantsDroits,
        dateNaissance: this.convertDate(row[DATE_NAISSANCE]),
        datePremiereDom,
        decision: {
          agent,
          dateDebut: this.convertDate(row[DATE_DEBUT_DOM]),
          dateDecision,
          dateFin: this.convertDate(row[DATE_FIN_DOM]),
          motif,
          statut: row[STATUT_DOM],
          userId: user.id,
          userName: agent
        },
        email: row[EMAIL],
        etapeDemande: 5,
        historique: [
          {
            agent,
            dateDebut: new Date(),
            dateDecision: new Date(),
            dateFin: new Date(),
            motif,
            statut: "IMPORT",
            userId: user.id,
            userName: agent
          }
        ],
        nom: row[NOM],
        phone: row[PHONE],
        prenom: row[PRENOM],
        sexe,
        structureId: user.structureId,
        surnom: row[SURNOM],
        typeDom: row[TYPE_DOM],
        villeNaissance: row[LIEU_NAISSANCE]
      };

      usagers.push(await this.usagersService.save(usager, user));

      if (index + 1 >= datas.length) {
        return true;
      }
    }
  }

  private convertDate(dateFr: string) {
    const dateParts = dateFr.split("/");
    const dateEn = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    const newDate = new Date(dateEn).toISOString();
    return newDate;
  }

  private countErrors(variable: boolean, idRow: any, idColumn: number) {
    const position = idRow.toString() + "_" + idColumn.toString();
    if (variable !== true) {
      this.logger.log(
        "ID row : " + idRow + " -- " + variable + " Col " + idColumn
      );
      this.errorsId.push(position);
    }
    return variable;
  }

  private notEmpty(value: string): boolean {
    return value !== undefined && value !== null && value !== "";
  }

  private validDate(date: string, required: boolean): boolean {
    if ((date === undefined || date === null || date === "") && !required) {
      return true;
    }
    return RegExp(regexp.date).test(date);
  }

  private validPhone(phone: string): boolean {
    if (!phone || phone === null || phone === "") {
      return true;
    }
    return RegExp(regexp.phone).test(phone);
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

    const types = {
      demande: ["PREMIERE", "RENOUVELLEMENT"],
      lienParente: ["ENFANT", "CONJOINT", "PARENT", "AUTRE"],
      menage: [
        "HOMME_ISOLE_SANS_ENFANT",
        "FEMME_ISOLE_SANS_ENFANT",
        "HOMME_ISOLE_AVEC_ENFANT",
        "FEMME_ISOLE_AVEC_ENFANT",
        "COUPLE_SANS_ENFANT",
        "COUPLE_AVEC_ENFANT",
        "MINEUR"
      ],
      motifRadiation: [
        "NON_MANIFESTATION_3_MOIS",
        "A_SA_DEMANDE",
        "ENTREE_LOGEMENT",
        "PLUS_DE_LIEN_COMMUNE",
        "NON_RESPECT_REGLEMENT",
        "AUTRE"
      ],
      motifRefus: ["LIEN_COMMUNE", "SATURATION", "HORS_AGREMENT", "AUTRE"],
      statut: ["VALIDE", "ATTENTE_DECISION", "REFUS", "RADIE", "EXPIRE"]
    };

    return types[rowName].indexOf(data) > -1;
  }
}
