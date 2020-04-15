import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import * as crypto from "crypto";
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import * as rimraf from "rimraf";
import { AccessGuard } from "../../auth/access.guard";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { ConfigService } from "../../config/config.service";
import { InteractionsService } from "../../interactions/interactions.service";
import { UsersService } from "../../users/services/users.service";
import { User } from "../../users/user.interface";
import { DecisionDto } from "../dto/decision.dto";
import { EntretienDto } from "../dto/entretien.dto";
import { ProcurationDto } from "../dto/procuration.dto";
import { RdvDto } from "../dto/rdv.dto";

import { TransfertDto } from "../dto/transfert.dto";
import { UsagersDto } from "../dto/usagers.dto";
import { Usager } from "../interfaces/usagers";
import { CerfaService } from "../services/cerfa.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";

@UseGuards(AuthGuard("jwt"))
@Controller("usagers")
export class UsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly usersService: UsersService,
    private readonly docsService: DocumentsService,
    private readonly interactionService: InteractionsService,
    private readonly cerfaService: CerfaService
  ) {}

  /* FORMULAIRE INFOS */
  @Post()
  public postUsager(@Body() usagerDto: UsagersDto, @CurrentUser() user: User) {
    return this.usagersService.create(usagerDto, user);
  }

  @UseGuards(AccessGuard)
  @Patch(":id")
  public async patchUsager(
    @Body() usagerDto: UsagersDto,
    @CurrentUsager() usager: Usager
  ) {
    if (
      usagerDto.typeDom === "RENOUVELLEMENT" ||
      usagerDto.etapeDemande === 0
    ) {
      usagerDto.etapeDemande = 1;
    }

    return this.usagersService.patch(usagerDto, usager._id);
  }

  @Post("rdv/:id")
  @UseGuards(AccessGuard)
  public async postRdv(
    @Body() rdvDto: RdvDto,
    @CurrentUser() currentUser: User,
    @CurrentUsager() usager: Usager
  ) {
    const user = await this.usersService.findOne({
      id: rdvDto.userId,
      structureId: currentUser.structureId,
    });
    if (!user) {
      throw new HttpException("USER_NOT_EXIST", HttpStatus.BAD_GATEWAY);
    }
    return this.usagersService.setRdv(usager.id, rdvDto, user);
  }

  @UseGuards(AccessGuard)
  @Post("entretien/:id")
  public setEntretien(
    @Body() entretien: EntretienDto,
    @CurrentUsager() usager: Usager
  ) {
    return this.usagersService.setEntretien(usager._id, entretien);
  }

  @UseGuards(AccessGuard)
  @Get("next-step/:id/:etapeDemande")
  public async nextStep(
    @Param("etapeDemande") etapeDemande: number,
    @CurrentUsager() usager: Usager
  ) {
    return this.usagersService.nextStep(usager._id, etapeDemande);
  }

  @UseGuards(AccessGuard)
  @Get("stop-courrier/:id")
  public async stopCourrier(@CurrentUsager() usager: Usager) {
    usager.options.npai.actif = true;
    usager.options.npai.dateDebut = new Date();
    return this.usagersService.patch(usager, usager._id);
  }

  @UseGuards(AccessGuard)
  @Get("renouvellement/:id")
  public async renouvellement(
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    return this.usagersService.renouvellement(usager, user);
  }

  @UseGuards(RolesGuard)
  @Get("stats-domifa/all")
  public async allStats() {
    return this.usagersService.getStats();
  }

  @UseGuards(RolesGuard)
  @Get("stats-domifa/structures")
  public async structuresStats() {
    return this.usagersService.getStatsByStructure();
  }

  @UseGuards(AccessGuard)
  @UseGuards(RolesGuard)
  @Post("decision/:id")
  public async setDecision(
    @Body() decision: DecisionDto,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    decision.userName = user.prenom + " " + user.nom;
    decision.userId = user.id;
    decision.dateDecision = new Date();

    const lastDecision = usager.decision;

    if (decision.statut === "ATTENTE_DECISION") {
      /* Mail au responsable */
    }

    if (decision.statut === "REFUS") {
      /* Récupération du dernier ID lié à la structure */
      /* SMS & Mail pr prévenir */

      decision.dateFin =
        decision.dateFin !== undefined && decision.dateFin !== null
          ? new Date(decision.dateFin)
          : new Date();
      decision.dateDebut = decision.dateFin;
    }

    if (decision.statut === "RADIE") {
      decision.dateDebut = new Date();
      decision.dateFin = new Date();
    }

    if (decision.statut === "VALIDE") {
      if (!usager.datePremiereDom) {
        usager.typeDom = "RENOUVELLEMENT";
      }
      if (decision.dateFin !== undefined && decision.dateFin !== null) {
        decision.dateFin = new Date(decision.dateFin);
      } else {
        decision.dateFin = new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        );
      }
      decision.dateDebut = new Date(decision.dateDebut);
    }

    return this.usagersService.setDecision(
      usager.id,
      user.structureId,
      decision,
      lastDecision
    );
  }

  /* DOUBLON */
  @Get("doublon/:nom/:prenom")
  public isDoublon(
    @Param("nom") nom: string,
    @Param("prenom") prenom: string,
    @CurrentUser() user: User
  ) {
    return this.usagersService.isDoublon(nom, prenom, user);
  }

  @UseGuards(RolesGuard)
  @UseGuards(AccessGuard)
  @Delete(":id")
  public async deleteOne(
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager,
    @Res() res: any
  ) {
    const pathFile = path.resolve(
      new ConfigService().get("UPLOADS_FOLDER") +
        user.structureId +
        "/" +
        usager.id
    );

    await this.interactionService.deleteByUsager(usager.id, user.structureId);

    const deleteUsager = await this.usagersService.delete(usager._id);

    if (deleteUsager && deleteUsager.deletedCount === 1) {
      if (fs.existsSync(pathFile)) {
        rimraf(pathFile, (error: any) => {
          this.captureErrors(
            { message: "CANNOT_DELETE_FOLDER", err: error },
            HttpStatus.BAD_REQUEST,
            res
          );
        });
        return true;
      }
    }
  }

  @UseGuards(AccessGuard)
  @Post("transfert/:id")
  public async editTransfert(
    @Body() transfertDto: TransfertDto,
    @CurrentUsager() usager: Usager
  ) {
    usager.options.transfert = {
      actif: true,
      adresse: transfertDto.adresse,
      dateDebut: new Date(),
      dateFin: new Date(transfertDto.dateFin),
      nom: transfertDto.nom,
    };

    return this.usagersService.patch(usager, usager._id);
  }

  @UseGuards(AccessGuard)
  @Delete("transfert/:id")
  public async deleteTransfert(@CurrentUsager() usager: Usager) {
    usager.options.transfert = {
      actif: false,
      adresse: "",
      nom: "",
      dateDebut: null,
      dateFin: null,
    };
    return this.usagersService.patch(usager, usager._id);
  }

  @UseGuards(AccessGuard)
  @Post("procuration/:id")
  public async editProcuration(
    @Body() procurationDto: ProcurationDto,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    usager.options.procuration = {
      actif: true,
      dateFin: procurationDto.dateFin,
      dateNaissance: procurationDto.dateNaissance,
      nom: procurationDto.nom,
      prenom: procurationDto.prenom,
    };

    return this.usagersService.patch(usager, usager._id);
  }

  @UseGuards(AccessGuard)
  @Delete("procuration/:id")
  public async deleteProcuration(
    @Param("id") usagerId: number,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    usager.options.procuration = {
      actif: false,
      dateFin: null,
      dateNaissance: "null",
      nom: "",
      prenom: "",
    };

    return this.usagersService.patch(usager, usager._id);
  }

  @UseGuards(AccessGuard)
  @Get("attestation/:id")
  public async getAttestation(
    @Param("id") usagerId: number,
    @Res() res: any,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    return this.cerfaService
      .attestation(usager, user)
      .then((buffer) => {
        res.setHeader("content-type", "application/pdf");
        res.send(buffer);
      })
      .catch((err: any) => {
        const erreur = {
          err,
          message: "CERFA_ERROR",
        };
        this.captureErrors(erreur, HttpStatus.INTERNAL_SERVER_ERROR, res);
      });
  }

  /* DOCUMENT */
  @UseGuards(AccessGuard)
  @Delete("document/:id/:index")
  public async deleteDocument(
    @Param("id") usagerId: number,
    @Param("index") index: number,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager,
    @Res() res: any
  ) {
    if (
      typeof usager.docs[index] === "undefined" ||
      typeof usager.docsPath[index] === "undefined"
    ) {
      this.captureErrors(
        {
          message: "DOC_NOT_FOUND_DELETE",
          usagerId,
          structureId: usager.structureId,
        },
        HttpStatus.BAD_REQUEST,
        res
      );
    }

    const fileInfos = usager.docs[index];
    fileInfos.path = usager.docsPath[index];

    const pathFile = path.resolve(
      new ConfigService().get("UPLOADS_FOLDER") +
        usager.structureId +
        "/" +
        usager.id +
        "/" +
        fileInfos.path
    );
    try {
      fs.unlinkSync(pathFile);
    } catch (err) {
      this.captureErrors(
        { message: "CANNOT_DELETE_FILE", file: pathFile, err },
        HttpStatus.BAD_REQUEST,
        res
      );
    }

    return this.docsService.deleteDocument(usagerId, index, user);
  }

  @UseGuards(AccessGuard)
  @Get("document/:id/:index")
  public async getDocument(
    @Param("id") usagerId: number,
    @Param("index") index: number,
    @Res() res: any,
    @CurrentUsager() usager: Usager
  ) {
    if (
      typeof usager.docs[index] === "undefined" ||
      typeof usager.docsPath[index] === "undefined"
    ) {
      this.captureErrors(
        {
          message: "DOC_NOT_FOUND_GET",
          usagerId,
          structureId: usager.structureId,
        },

        HttpStatus.BAD_REQUEST,
        res
      );
    }

    const fileInfos = usager.docs[index];
    fileInfos.path = usager.docsPath[index];

    const pathFile = path.resolve(
      new ConfigService().get("UPLOADS_FOLDER") +
        usager.structureId +
        "/" +
        usager.id +
        "/" +
        fileInfos.path
    );

    if (!fs.existsSync(pathFile + ".encrypted")) {
      if (!fs.existsSync(pathFile)) {
        this.captureErrors(
          { message: "UNENCRYPTED_FILE_NOT_FOUND", file: pathFile },
          HttpStatus.BAD_REQUEST,
          res
        );
      } else {
        this.encryptFile(pathFile, res);
      }
    }

    const key = new ConfigService().get("FILES_PRIVATE");
    const iv = new ConfigService().get("FILES_IV");

    const decipher = crypto.createDecipheriv("aes-256-cfb", key, iv);

    const input = fs.createReadStream(pathFile + ".encrypted");
    const output = fs.createWriteStream(pathFile + ".unencrypted");

    input
      .pipe(decipher)
      .pipe(output)
      .on("finish", () => {
        res.sendFile(output.path);
        this.deleteFile(pathFile + ".unencrypted", res);
      });
  }

  @Post("document/:id")
  @UseGuards(AccessGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (req: any, file: any, cb: any) => {
        const mimeTest = !file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/);
        const sizeTest = file.size >= 5242880;
        if (sizeTest || mimeTest) {
          throw new BadRequestException({
            fileSize: sizeTest,
            fileType: mimeTest,
          });
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const dir =
            new ConfigService().get("UPLOADS_FOLDER") +
            req.user.structureId +
            "/" +
            req.usager.id;

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
  public uploadDoc(
    @Param("id") usagerId: number,
    @UploadedFile() file: any,
    @Body() postData: any,
    @CurrentUser() user: User,
    @Res() res: any
  ) {
    const userName = user.prenom + " " + user.nom;

    const newDoc = {
      createdAt: new Date(),
      createdBy: userName,
      filetype: file.mimetype,
      label: postData.label,
    };

    const fileName =
      new ConfigService().get("UPLOADS_FOLDER") +
      user.structureId +
      "/" +
      usagerId +
      "/" +
      file.filename;

    this.encryptFile(fileName, res);

    return this.docsService.addDocument(
      usagerId,
      user.structureId,
      file.filename,
      newDoc
    );
  }

  @UseGuards(AccessGuard)
  @Get(":id")
  public async findOne(@CurrentUsager() usager: Usager) {
    return usager;
  }

  private deleteFile(pathFile: string, @Res() res: any) {
    setTimeout(() => {
      try {
        fs.unlinkSync(pathFile);
      } catch (err) {
        this.captureErrors(
          {
            message: "CANNOT_DELETE_FILE",
            file: pathFile,
            err,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
          res
        );
      }
    }, 2500);
  }

  private encryptFile(fileName: string, @Res() res: any) {
    const key = new ConfigService().get("FILES_PRIVATE");
    const iv = new ConfigService().get("FILES_IV");

    const cipher = crypto.createCipheriv("aes-256-cfb", key, iv);

    const input = fs.createReadStream(fileName);
    const output = fs.createWriteStream(fileName + ".encrypted");

    return input
      .pipe(cipher)
      .pipe(output)
      .on("finish", () => {
        try {
          fs.unlinkSync(fileName);
        } catch (err) {
          this.captureErrors(
            {
              message: "CANNOT_ENCRYPT_FILE",
              file: fileName,
              err,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
            res
          );
        }
        return output.path;
      });
  }

  private captureErrors(err: any, statuts: HttpStatus, @Res() res: any) {
    throw new HttpException(err, statuts);
  }
}
