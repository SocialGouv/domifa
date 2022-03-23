import { Injectable } from "@nestjs/common";

import {
  usagerLightRepository,
  usagerRepository,
  UsagerTable,
} from "../../database";
import { usagerHistoryRepository } from "../../database/services/usager/usagerHistoryRepository.service";
import { uuidGenerator } from "../../database/services/uuid";
import {
  ETAPE_DECISION,
  ETAPE_DOSSIER_COMPLET,
  ETAPE_ENTRETIEN,
  ETAPE_ETAT_CIVIL,
  ETAPE_RENDEZ_VOUS,
  Usager,
  UsagerLight,
  UserStructure,
  UserStructureProfile,
  UsagerTypeDom,
} from "../../_common/model";
import { usagerHistoryStateManager } from "./usagerHistoryStateManager.service";
import { usagersCreator } from "./usagersCreator.service";
import { usagerVisibleHistoryManager } from "./usagerVisibleHistoryManager.service";
import { CreateUsagerDto } from "../dto/CreateUsagerDto";
import { RdvDto } from "../dto/rdv.dto";
import { DecisionDto } from "../dto";

import { endOfDay, subMinutes } from "date-fns";

@Injectable()
export class UsagersService {
  public async create(
    usagerDto: CreateUsagerDto,
    user: UserStructureProfile
  ): Promise<UsagerLight> {
    const usager = new UsagerTable(usagerDto);
    const now = new Date();

    usagersCreator.setUsagerDefaultAttributes(usager);

    usager.ref = await usagersCreator.findNextUsagerRef(user.structureId);
    usager.customRef = `${usager.ref}`;

    usager.decision = {
      uuid: uuidGenerator.random(),
      dateDecision: now,
      statut: "INSTRUCTION",
      userName: user.prenom + " " + user.nom,
      userId: user.id,
      dateFin: now,
      dateDebut: now,
    };

    usager.historique.push(usager.decision);

    usager.structureId = user.structureId;
    usager.etapeDemande = ETAPE_RENDEZ_VOUS;

    const createdUsager = await usagerLightRepository.save(usager);

    const usagerHistory = usagerHistoryStateManager.buildInitialHistoryState({
      isImport: false,
      usager: createdUsager,
      createdAt: createdUsager.decision.dateDecision,
      createdEvent: "new-decision",
      historyBeginDate: createdUsager.decision.dateDebut,
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
    usager: UsagerLight,
    user: Pick<UserStructure, "id" | "nom" | "prenom" | "structure">
  ): Promise<UsagerLight> {
    const now = new Date();

    const typeDom: UsagerTypeDom =
      usager.decision.statut === "REFUS" || usager.decision.statut === "RADIE"
        ? "PREMIERE_DOM"
        : "RENOUVELLEMENT";

    let newDateFin = null;

    // Pour les renouvellements de dossier encore valide, on reprend l'actuelle date de fin
    if (usager.decision.statut === "VALIDE") {
      newDateFin = endOfDay(usager.decision.dateFin);
    }

    usager.decision = {
      uuid: uuidGenerator.random(),
      dateDebut: now,
      dateDecision: now,
      dateFin: newDateFin,
      statut: "INSTRUCTION",
      userId: user.id,
      userName: user.prenom + " " + user.nom,
      typeDom,
    };

    // Ajout du précédent état dans l'historique
    usagerVisibleHistoryManager.addDecisionToVisibleHistory({ usager });

    usager.options.npai = {
      actif: false,
      dateDebut: null,
    };

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

    usager.lastInteraction.dateInteraction = now;

    return usagerLightRepository.updateOne(
      { uuid: usager.uuid },
      {
        lastInteraction: usager.lastInteraction,
        decision: usager.decision,
        options: usager.options,
        historique: usager.historique,
        etapeDemande: usager.etapeDemande,
        typeDom,
        rdv: usager.rdv,
      }
    );
  }

  public async setDecision(
    { uuid }: { uuid: string },
    decision: DecisionDto
  ): Promise<UsagerLight> {
    // Adaptation de la timeZone
    const now = new Date();
    decision.dateDecision = now;

    const usager = await usagerRepository.findOne({
      uuid,
    });

    usager.etapeDemande = ETAPE_DOSSIER_COMPLET;

    if (decision.statut === "ATTENTE_DECISION") {
      usager.etapeDemande = ETAPE_DECISION;
    }

    if (decision.statut === "REFUS" || decision.statut === "RADIE") {
      decision.dateFin =
        decision.dateFin !== undefined && decision.dateFin !== null
          ? // Fin de la journée pour la date de fin
            endOfDay(new Date(decision.dateFin))
          : now;
      decision.dateDebut = decision.dateFin;
    }

    // Valide
    if (decision.statut === "VALIDE") {
      // Date de début = au moment de la décision
      decision.dateDebut = new Date(decision.dateDebut);
      // Date de fin = fin de la journée indiquée
      decision.dateFin = endOfDay(new Date(decision.dateFin));

      const actualLastInteraction = new Date(
        usager.lastInteraction.dateInteraction
      );

      // Si la dom est valide après le dernier passage, on le met à jour
      if (decision.dateDebut > actualLastInteraction) {
        usager.lastInteraction.dateInteraction = decision.dateDebut;
      }

      // ID personnalisé
      if (decision.customRef) {
        usager.customRef = decision.customRef;
      }

      // Date de premiere dom
      if (usager.datePremiereDom !== null) {
        usager.typeDom = "RENOUVELLEMENT";
      } else {
        usager.typeDom = "PREMIERE_DOM";
        usager.datePremiereDom = decision.dateDebut;
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

    return usagerLightRepository.updateOne(
      { uuid },
      {
        lastInteraction: usager.lastInteraction,
        customRef: usager.customRef,
        entretien: usager.entretien,
        decision: usager.decision,
        options: usager.options,
        historique: usager.historique,
        etapeDemande: usager.etapeDemande,
        typeDom: usager.typeDom,
        datePremiereDom: usager.datePremiereDom,
      }
    );
  }

  public async setRdv(
    uuid: string,
    rdv: RdvDto,
    user: UserStructureProfile
  ): Promise<UsagerLight> {
    let usager = await usagerRepository.findOne({
      uuid,
    });

    usager.rdv = {
      userId: rdv.userId,
      userName: user.prenom + " " + user.nom,
      dateRdv: rdv.dateRdv,
    };

    if (rdv.isNow) {
      usager.etapeDemande = ETAPE_ENTRETIEN;
      usager.rdv.dateRdv = subMinutes(new Date(), 1);
    }

    usager = await usagerLightRepository.updateOne(
      { uuid },
      { rdv: usager.rdv, etapeDemande: usager.etapeDemande }
    );

    return usager;
  }

  public async getLastFiveCustomRef(
    structureId: number,
    usagerRef: number
  ): Promise<
    Pick<
      Usager,
      "ref" | "customRef" | "nom" | "sexe" | "prenom" | "structureId"
    >[]
  > {
    return usagerLightRepository.findLastFiveCustomRef({
      structureId,
      usagerRef,
    });
  }

  public async export(structureId: number): Promise<Usager[]> {
    return usagerRepository.findMany({ structureId });
  }
}
