import {
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
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import * as fs from "fs";
import * as path from "path";

import { AccessGuard } from "../../auth/guards/access.guard";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";

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

import { UsagersService } from "../services/usagers.service";
import { ResponsableGuard } from "../../auth/guards/responsable.guard";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { InteractionDto } from "../../interactions/interactions.dto";

@UseGuards(AuthGuard("jwt"))
@Controller("usagers")
export class UsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly usersService: UsersService,
    private readonly interactionService: InteractionsService,
    private readonly cerfaService: CerfaService
  ) {}

  /* FORMULAIRE INFOS */
  @Post()
  public postUsager(@Body() usagerDto: UsagersDto, @CurrentUser() user: User) {
    return this.usagersService.create(usagerDto, user);
  }

  @UseGuards(AccessGuard)
  @UseGuards(FacteurGuard)
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
  public async stopCourrier(
    @CurrentUsager() usager: Usager,
    @CurrentUser() user: User
  ) {
    if (usager.options.npai.actif) {
      usager.options.npai.actif = false;
      usager.options.npai.dateDebut = null;
    } else {
      usager.options.npai.actif = true;
      usager.options.npai.dateDebut = new Date();
    }

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

  @UseGuards(AccessGuard)
  @UseGuards(FacteurGuard)
  @Post("decision/:id")
  public async setDecision(
    @Body() decision: DecisionDto,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    decision.userName = user.prenom + " " + user.nom;
    decision.userId = user.id;
    decision.dateDecision = new Date();
    usager.historique.push(usager.decision);

    if (decision.statut === "ATTENTE_DECISION") {
      /* Mail au responsable */
    }

    if (decision.statut === "REFUS") {
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
      if (usager.datePremiereDom !== null) {
        usager.typeDom = "RENOUVELLEMENT";
      } else {
        usager.typeDom = "PREMIERE";
        usager.datePremiereDom = new Date(decision.dateDebut);
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

    return this.usagersService.setDecision(usager._id, decision, usager);
  }

  @Get("doublon/:nom/:prenom")
  public isDoublon(
    @Param("nom") nom: string,
    @Param("prenom") prenom: string,
    @CurrentUser() user: User
  ) {
    return this.usagersService.isDoublon(nom, prenom, user);
  }

  @UseGuards(ResponsableGuard)
  @UseGuards(AccessGuard)
  @Delete(":id")
  public async delete(
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager,
    @Res() res: any
  ) {
    const pathFile = path.resolve(
      new ConfigService().get("UPLOADS_FOLDER") +
        usager.structureId +
        "/" +
        usager.id
    );

    await this.interactionService.deleteByUsager(usager.id, user.structureId);

    if (fs.existsSync(pathFile)) {
      fs.readdir(pathFile, (err, files) => {
        if (err) {
          throw new HttpException(
            {
              message:
                "CANNOT_READ_FOLDER : " +
                pathFile +
                "\n Err: " +
                JSON.stringify(err),
            },
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }

        for (const file of files) {
          fs.unlink(path.join(pathFile, file), (error: any) => {
            if (err) {
              throw new HttpException(
                {
                  message:
                    "CANNOT_DELETE_FILE: " +
                    file +
                    "\n Err: " +
                    JSON.stringify(error),
                },
                HttpStatus.INTERNAL_SERVER_ERROR
              );
            }
          });
        }
      });
    }

    const usagerToDelete = await this.usagersService.delete(usager._id);
    if (!usagerToDelete || usagerToDelete === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_DELETE_USAGER" });
    }

    return res.status(HttpStatus.OK).json({ message: "DELETE_SUCCESS" });
  }

  @UseGuards(AccessGuard)
  @Post("transfert/:id")
  public async editTransfert(
    @Body() transfertDto: TransfertDto,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    const action = usager.options.transfert.actif ? "EDIT" : "CREATION";

    const newTransfert = {
      actif: true,
      adresse: transfertDto.adresse,
      dateDebut: new Date(),
      dateFin: new Date(transfertDto.dateFin),
      nom: transfertDto.nom,
    };

    usager.options.historique.transfert.push({
      user: user.prenom + " " + user.nom,
      action,
      date: new Date(),
      content: newTransfert,
    });

    usager.options.transfert = newTransfert;

    return this.usagersService.patch(usager, usager._id);
  }

  @UseGuards(AccessGuard)
  @Delete("renew/:id")
  public async deleteRenew(@CurrentUsager() usager: Usager) {
    usager.etapeDemande = 1;
    usager.decision = usager.historique[usager.historique.length - 1];
    usager.historique.splice(usager.historique.length - 1, 1);
    return this.usagersService.patch(usager, usager._id);
  }

  @UseGuards(AccessGuard)
  @Delete("transfert/:id")
  public async deleteTransfert(
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    usager.options.transfert = {
      actif: false,
      adresse: "",
      nom: "",
      dateDebut: null,
      dateFin: null,
    };

    usager.options.historique.transfert.push({
      user: user.prenom + " " + user.nom,
      action: "DELETE",
      date: new Date(),
      content: {},
    });

    return this.usagersService.patch(usager, usager._id);
  }

  @UseGuards(AccessGuard)
  @Post("procuration/:id")
  public async editProcuration(
    @Body() procurationDto: ProcurationDto,
    @CurrentUser() user: User,
    @CurrentUsager() usager: Usager
  ) {
    const action = usager.options.procuration.actif ? "EDIT" : "CREATION";
    const newProcuration = {
      actif: true,
      dateFin: procurationDto.dateFin,
      dateNaissance: procurationDto.dateNaissance,
      nom: procurationDto.nom,
      prenom: procurationDto.prenom,
    };

    usager.options.historique.procuration.push({
      user: user.prenom + " " + user.nom,
      action,
      date: new Date(),
      content: newProcuration,
    });

    usager.options.procuration = newProcuration;
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

    usager.options.historique.procuration.push({
      user: user.prenom + " " + user.nom,
      action: "DELETE",
      date: new Date(),
      content: {},
    });

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

  @UseGuards(AccessGuard)
  @Get(":id")
  public async findOne(@CurrentUsager() usager: Usager) {
    return usager;
  }

  private captureErrors(err: any, statuts: HttpStatus, @Res() res: any) {
    throw new HttpException(err, statuts);
  }
}
