import { Injectable } from "@nestjs/common";
import {
  UsagerLight,
  usagerLightRepository,
  UsagerPG,
  usagerRepository,
  UsagerTable,
} from "../../database";
import { UsagerDecision } from "../../database/entities/usager/UsagerDecision.type";
import {
  USAGER_DEFAULT_OPTIONS,
  USAGER_DEFAULT_PREFERENCE,
} from "../../database/services/usager/USAGER_DEFAULTS.const";
import { AppUser, UserProfile } from "../../_common/model";
import { CreateUsagerDto } from "../dto/create-usager.dto";
import { EntretienDto } from "../dto/entretien.dto";
import { RdvDto } from "../dto/rdv.dto";
import { Usager } from "../interfaces/usagers";

import moment = require("moment");
import {
  ETAPE_DECISION,
  ETAPE_DOSSIER_COMPLET,
  ETAPE_ENTRETIEN,
  ETAPE_ETAT_CIVIL,
  ETAPE_DOCUMENTS,
  ETAPE_RENDEZ_VOUS,
} from "../../database/entities/usager/ETAPES_DEMANDE.const";
@Injectable()
export class UsagersService {
  constructor() {}

  public async create(
    usagerDto: CreateUsagerDto,
    user: UserProfile
  ): Promise<UsagerLight> {
    const usager = new UsagerTable(usagerDto);

    this.setUsagerDefaultAttributes(usager);

    usager.ref = await this.findNextUsagerRef(user.structureId);
    usager.customRef = `${usager.ref}`;

    usager.decision = {
      dateDecision: new Date(),
      statut: "INSTRUCTION",
      userName: user.prenom + " " + user.nom,
      userId: user.id,
      dateFin: new Date(),
    };

    usager.structureId = user.structureId;
    usager.etapeDemande = ETAPE_RENDEZ_VOUS;

    return usagerLightRepository.save(usager);
  }

  public async createFromImport({
    data,
    user,
  }: {
    data: Partial<UsagerPG>;
    user: Pick<AppUser, "structureId">;
  }) {
    const usager = new UsagerTable(data);
    this.setUsagerDefaultAttributes(usager);

    usager.ref = await this.findNextUsagerRef(user.structureId);
    usager.customRef =
      data.customRef && data.customRef.trim()
        ? data.customRef.trim()
        : `${usager.ref}`;
    return usagerLightRepository.save(usager);
  }

  public async patch(
    { uuid }: { uuid: string },
    update: Partial<UsagerPG>
  ): Promise<Usager> {
    return usagerLightRepository.updateOne({ uuid }, update);
  }

  public async nextStep({ uuid }: { uuid: string }, etapeDemande: number) {
    return usagerLightRepository.updateOne({ uuid }, { etapeDemande });
  }

  public async renouvellement(
    { uuid }: { uuid: string },
    user: Pick<AppUser, "id" | "nom" | "prenom">
  ): Promise<UsagerLight> {
    const usager = await usagerRepository.findOne({
      uuid,
    });

    (usager.historique = usager.historique.concat([usager.decision])),
      (usager.decision = {
        dateDebut: new Date(),
        dateDecision: new Date(),
        statut: "INSTRUCTION",
        userId: user.id,
        userName: user.prenom + " " + user.nom,
        typeDom: "RENOUVELLEMENT",
      });

    if (!usager.options.npai) {
      usager.options.npai = {} as any;
    }

    usager.options.npai.actif = false;
    usager.options.npai.dateDebut = null;

    usager.etapeDemande = ETAPE_ETAT_CIVIL;

    usager.typeDom = "RENOUVELLEMENT";

    usager.rdv = null;

    return usagerLightRepository.save(usager);
  }

  public async setEntretien(
    { uuid }: { uuid: string },
    entretienForm: EntretienDto
  ): Promise<Usager> {
    return usagerLightRepository.updateOne(
      { uuid },
      {
        entretien: entretienForm,
        etapeDemande: ETAPE_DOCUMENTS,
      }
    );
  }

  public async setDecision(
    { uuid }: { uuid: string },
    decision: UsagerDecision
  ): Promise<UsagerLight> {
    decision.dateDecision = new Date();

    const usager = await usagerRepository.findOne({
      uuid,
    });
    usager.historique.push(usager.decision);

    usager.etapeDemande = ETAPE_DOSSIER_COMPLET;

    if (decision.statut === "ATTENTE_DECISION") {
      /* Mail au responsable */
      usager.etapeDemande = ETAPE_DECISION;
    }

    if (decision.statut === "REFUS") {
      /* SMS & Mail pr prévenir */

      decision.dateFin =
        decision.dateFin !== undefined && decision.dateFin !== null
          ? new Date(decision.dateFin)
          : new Date();
      decision.dateDebut = decision.dateFin;
    } else if (decision.statut === "RADIE") {
      decision.dateDebut = new Date();
      decision.dateFin = new Date();
    } else if (decision.statut === "VALIDE") {
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
      usager.lastInteraction.dateInteraction = decision.dateDebut;
    }

    usager.decision = decision;
    if (!usager.entretien) {
      usager.entretien = {};
    }

    return usagerLightRepository.save(usager);
  }

  public async setRdv(
    { uuid }: { uuid: string },
    rdv: RdvDto,
    user: UserProfile
  ): Promise<UsagerLight> {
    const usager = await usagerRepository.findOne({
      uuid,
    });

    if (!usager.rdv) {
      usager.rdv = {} as any;
    }

    if (rdv.isNow) {
      usager.etapeDemande = ETAPE_ENTRETIEN;
      rdv.dateRdv = moment.utc().subtract(1, "minutes").toDate();
    } else {
      rdv.dateRdv = moment.utc(rdv.dateRdv).toDate();
    }

    usager.rdv.dateRdv = rdv.dateRdv;
    usager.rdv.userId = rdv.userId;
    usager.rdv.userName = user.prenom + " " + user.nom;

    return usagerLightRepository.save(usager);
  }

  public async export(structureId: number): Promise<UsagerPG[]> {
    return usagerRepository.findMany({ structureId });
  }

  public async findNextUsagerRef(structureId: number): Promise<number> {
    const maxRef = await usagerRepository.max({
      maxAttribute: "ref",
      where: {
        structureId,
      },
    });
    const nextRef = maxRef ? maxRef + 1 : 1;
    return nextRef;
  }

  public setUsagerDefaultAttributes(usager: UsagerTable) {
    if (!usager.ayantsDroits) usager.ayantsDroits = [];
    if (!usager.historique) usager.historique = [];
    if (!usager.rdv) usager.rdv = null;
    if (!usager.docs) usager.docs = [];
    if (!usager.docs) usager.docs = [];
    if (!usager.docsPath) usager.docsPath = [];
    if (!usager.entretien) usager.entretien = {};
    if (!usager.options) {
      usager.options = USAGER_DEFAULT_OPTIONS;
    }
    if (!usager.preference) {
      usager.preference = USAGER_DEFAULT_PREFERENCE;
    }

    usager.lastInteraction = {
      dateInteraction: new Date(),
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0,
      enAttente: false,
    };
  }
}
