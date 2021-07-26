import { Injectable } from "@nestjs/common";
import {
  usagerLightRepository,
  usagerRepository,
  UsagerTable,
} from "../../database";
import { usagerHistoryRepository } from "../../database/services/usager/usagerHistoryRepository.service";
import { uuidGenerator } from "../../database/services/uuid";
import {
  AppUser,
  ETAPE_DECISION,
  ETAPE_DOSSIER_COMPLET,
  ETAPE_ENTRETIEN,
  ETAPE_ETAT_CIVIL,
  ETAPE_RENDEZ_VOUS,
  Usager,
  UsagerDecision,
  UsagerLight,
  UserProfile,
} from "../../_common/model";
import { CreateUsagerDto } from "../dto/create-usager.dto";
import { RdvDto } from "../dto/rdv.dto";
import { usagerHistoryStateManager } from "./usagerHistoryStateManager.service";
import { usagersCreator } from "./usagersCreator.service";
import { usagerVisibleHistoryManager } from "./usagerVisibleHistoryManager.service";

import moment = require("moment");
@Injectable()
export class UsagersService {
  constructor() {}

  public async create(
    usagerDto: CreateUsagerDto,
    user: UserProfile
  ): Promise<UsagerLight> {
    const usager = new UsagerTable(usagerDto);

    usagersCreator.setUsagerDefaultAttributes(usager);

    usager.ref = await usagersCreator.findNextUsagerRef(user.structureId);
    usager.customRef = `${usager.ref}`;

    usager.decision = {
      uuid: uuidGenerator.random(),
      dateDecision: new Date(),
      statut: "INSTRUCTION",
      userName: user.prenom + " " + user.nom,
      userId: user.id,
      dateFin: new Date(),
    };

    usager.historique.push(usager.decision);

    usager.structureId = user.structureId;
    usager.etapeDemande = ETAPE_RENDEZ_VOUS;

    const createdUsager = await usagerLightRepository.save(usager);

    const usagerHistory = usagerHistoryStateManager.buildInitialHistoryState({
      isImport: false,
      usager: createdUsager,
      createdAt: usager.decision.dateDecision,
      createdEvent: "new-decision",
      historyBeginDate: usager.decision.dateDebut,
    });

    await usagerHistoryRepository.save(usagerHistory);

    return createdUsager;
  }

  public async patch(
    { uuid }: { uuid: string },
    update: Partial<Usager>
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

    usager.decision = {
      uuid: uuidGenerator.random(),
      dateDebut: new Date(),
      dateDecision: new Date(),
      statut: "INSTRUCTION",
      userId: user.id,
      userName: user.prenom + " " + user.nom,
      typeDom: "RENOUVELLEMENT",
    };

    // Ajout du précédent état dans l'historique
    usagerVisibleHistoryManager.addDecisionToVisibleHistory({ usager });

    if (!usager.options.npai) {
      usager.options.npai = {} as any;
    }

    usager.options.npai.actif = false;
    usager.options.npai.dateDebut = null;

    usager.etapeDemande = ETAPE_ETAT_CIVIL;

    usager.typeDom = "RENOUVELLEMENT";

    usager.rdv = null;

    // Ajout du nouvel état
    await usagerHistoryStateManager.updateHistoryStateFromDecision({
      usager,
      createdAt: usager.decision.dateDecision,
      createdEvent: "new-decision",
      historyBeginDate: usager.decision.dateDebut,
    });

    return usagerLightRepository.save(usager);
  }

  public async setDecision(
    { uuid }: { uuid: string },
    decision: UsagerDecision
  ): Promise<UsagerLight> {
    decision.dateDecision = new Date();

    const usager = await usagerRepository.findOne({
      uuid,
    });

    usager.etapeDemande = ETAPE_DOSSIER_COMPLET;

    if (decision.statut === "ATTENTE_DECISION") {
      usager.etapeDemande = ETAPE_DECISION;
    }

    if (decision.statut === "REFUS") {
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
        usager.typeDom = "PREMIERE_DOM";
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

      if (
        decision.dateDebut > new Date(usager.lastInteraction.dateInteraction)
      ) {
        usager.lastInteraction.dateInteraction = decision.dateDebut;
      }
    }

    usager.decision.uuid = uuidGenerator.random();
    usager.decision = decision;

    if (!usager.entretien) {
      usager.entretien = {};
    }

    usagerVisibleHistoryManager.addDecisionToVisibleHistory({ usager });

    await usagerHistoryStateManager.updateHistoryStateFromDecision({
      usager,
      createdAt: usager.decision.dateDecision,
      createdEvent: "new-decision",
      historyBeginDate: usager.decision.dateDebut,
    });

    return usagerLightRepository.save(usager);
  }

  public async setRdv(
    { uuid }: { uuid: string },
    rdv: RdvDto,
    user: UserProfile
  ): Promise<UsagerLight> {
    let usager = await usagerRepository.findOne({
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

    usager = await usagerLightRepository.save(usager);

    await usagerHistoryStateManager.updateHistoryStateWithoutDecision({
      usager,
      createdBy: {
        userId: user.id,
        userName: user.prenom + " " + user.nom,
      },
      createdEvent: "update-rdv",
    });

    return usager;
  }

  public async export(structureId: number): Promise<Usager[]> {
    return usagerRepository.findMany({ structureId });
  }
}
