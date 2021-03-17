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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { CurrentUsager } from "../../auth/current-usager.decorator";
import { CurrentUser } from "../../auth/current-user.decorator";
import { FacteurGuard } from "../../auth/guards/facteur.guard";
import { ResponsableGuard } from "../../auth/guards/responsable.guard";
import { UsagerAccessGuard } from "../../auth/guards/usager-access.guard";
import { domifaConfig } from "../../config";
import {
  UsagerLight,
  usagerLightRepository,
  usagerRepository,
} from "../../database";
import {
  ETAPE_DOSSIER_COMPLET,
  ETAPE_ETAT_CIVIL,
  ETAPE_RENDEZ_VOUS,
} from "../../database/entities/usager/ETAPES_DEMANDE.const";
import { InteractionsService } from "../../interactions/interactions.service";
import { AppAuthUser } from "../../_common/model";
import { CreateUsagerDto } from "../dto/create-usager.dto";
import { DecisionDto } from "../dto/decision.dto";
import { EditUsagerDto } from "../dto/edit-usager.dto";
import { EntretienDto } from "../dto/entretien.dto";
import { PreferenceContactDto } from "../dto/preferenceContact.dto";
import { ProcurationDto } from "../dto/procuration.dto";
import { TransfertDto } from "../dto/transfert.dto";
import { CerfaService } from "../services/cerfa.service";
import { UsagersService } from "../services/usagers.service";

@Controller("usagers")
@ApiTags("usagers")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class UsagersController {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly interactionsService: InteractionsService,
    private readonly cerfaService: CerfaService
  ) {}

  @Get()
  public async findAllByStructure(@CurrentUser() user: AppAuthUser) {
    return usagerLightRepository.findMany(
      {
        structureId: user.structureId,
      },
      {}
    );
  }

  /* FORMULAIRE INFOS */
  @UseGuards(FacteurGuard)
  @Post()
  public postUsager(
    @Body() usagerDto: CreateUsagerDto,
    @CurrentUser() user: AppAuthUser
  ) {
    return this.usagersService.create(usagerDto, user);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Patch(":usagerRef")
  public async patchUsager(
    @Body() usagerDto: EditUsagerDto,
    @CurrentUsager() usager: UsagerLight
  ) {
    if (
      usagerDto.typeDom === "RENOUVELLEMENT" ||
      usagerDto.etapeDemande === ETAPE_ETAT_CIVIL
    ) {
      usagerDto.etapeDemande = ETAPE_RENDEZ_VOUS;
    }

    return this.usagersService.patch({ uuid: usager.uuid }, usagerDto);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Post("entretien/:usagerRef")
  public setEntretien(
    @Body() entretien: EntretienDto,
    @CurrentUsager() usager: UsagerLight
  ) {
    return this.usagersService.setEntretien({ uuid: usager.uuid }, entretien);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Get("next-step/:usagerRef/:etapeDemande")
  public async nextStep(
    @Param("etapeDemande") etapeDemande: number,
    @CurrentUsager() usager: UsagerLight
  ) {
    return this.usagersService.nextStep({ uuid: usager.uuid }, etapeDemande);
  }

  @UseGuards(UsagerAccessGuard)
  @Get("stop-courrier/:usagerRef")
  public async stopCourrier(@CurrentUsager() currentUsager: UsagerLight) {
    const usager = await usagerRepository.findOne({
      uuid: currentUsager.uuid,
    });
    if (usager.options.npai.actif) {
      usager.options.npai.actif = false;
      usager.options.npai.dateDebut = null;
    } else {
      usager.options.npai.actif = true;
      usager.options.npai.dateDebut = new Date();
    }

    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Get("renouvellement/:usagerRef")
  public async renouvellement(
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    return this.usagersService.renouvellement({ uuid: usager.uuid }, user);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Post("decision/:usagerRef")
  public async setDecision(
    @Body() decision: DecisionDto,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    decision.userName = user.prenom + " " + user.nom;
    decision.userId = user.id;
    return this.usagersService.setDecision({ uuid: usager.uuid }, decision);
  }

  @UseGuards(FacteurGuard)
  @Get("doublon/:nom/:prenom/:usagerRef")
  public async isDoublon(
    @Param("nom") nom: string,
    @Param("prenom") prenom: string,
    @Param("usagerRef") ref: number,
    @CurrentUser() user: AppAuthUser
  ): Promise<UsagerLight[]> {
    const doublons = await usagerLightRepository.findDoublons({
      nom,
      prenom,
      ref,
      structureId: user.structureId,
    });
    return doublons;
  }

  @UseGuards(ResponsableGuard, UsagerAccessGuard)
  @Delete(":usagerRef")
  public async delete(
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight,
    @Res() res: Response
  ) {
    const pathFile = path.resolve(
      domifaConfig().upload.basePath + usager.structureId + "/" + usager.ref
    );

    await this.interactionsService.deleteByUsager(usager.ref, user.structureId);

    deleteUsagerFolder(pathFile);

    const usagerToDelete = await usagerRepository.deleteByCriteria({
      uuid: usager.uuid,
    });
    if (!usagerToDelete || usagerToDelete === null) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_DELETE_USAGER" });
    }

    return res.status(HttpStatus.OK).json({ message: "DELETE_SUCCESS" });
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Post("transfert/:usagerRef")
  public async editTransfert(
    @Body() transfertDto: TransfertDto,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    const action = usager.options.transfert.actif ? "EDIT" : "CREATION";

    const newTransfert = {
      actif: true,
      adresse: transfertDto.adresse,
      dateDebut: new Date(transfertDto.dateDebut),
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

    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Post("preference/:usagerRef")
  public async editPreference(
    @Body() preferenceDto: PreferenceContactDto,
    @CurrentUsager() usager: UsagerLight
  ) {
    // TODO: check phone
    usager.preference = preferenceDto;
    // Nettoyage du téléphone
    if (!preferenceDto.phone) {
      preferenceDto.phoneNumber = null;
    }
    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Delete("renew/:usagerRef")
  public async deleteRenew(@CurrentUsager() usager: UsagerLight) {
    usager.etapeDemande = ETAPE_DOSSIER_COMPLET;

    usager.decision = usager.historique[usager.historique.length - 1];
    usager.historique.splice(usager.historique.length - 1, 1);
    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Delete("transfert/:usagerRef")
  public async deleteTransfert(
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
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

    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Post("procuration/:usagerRef")
  public async editProcuration(
    @Body() procurationDto: ProcurationDto,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    const action = usager.options.procuration.actif ? "EDIT" : "CREATION";
    const newProcuration = {
      actif: true,
      dateFin: new Date(procurationDto.dateFin),
      dateDebut: new Date(procurationDto.dateDebut),
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
    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }

  @UseGuards(UsagerAccessGuard, FacteurGuard)
  @Delete("procuration/:usagerRef")
  public async deleteProcuration(
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() usager: UsagerLight
  ) {
    usager.options.procuration = {
      actif: false,
      dateDebut: null,
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

    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }

  @UseGuards(UsagerAccessGuard)
  @Get("attestation/:usagerRef")
  public async getAttestation(
    @Res() res: Response,
    @CurrentUser() user: AppAuthUser,
    @CurrentUsager() currentUsager: UsagerLight
  ) {
    const usager = await usagerRepository.findOne({ uuid: currentUsager.uuid });

    return this.cerfaService
      .attestation(usager, user)
      .then((buffer) => {
        res.setHeader("content-type", "application/pdf");
        res.send(buffer);
      })
      .catch((err: any) => {
        throw new HttpException(
          {
            err,
            message: "CERFA_ERROR",
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });
  }

  @UseGuards(UsagerAccessGuard)
  @Get(":usagerRef")
  public async findOne(@CurrentUsager() usager: UsagerLight) {
    return usager;
  }
}
function deleteUsagerFolder(pathFile: string) {
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
}
