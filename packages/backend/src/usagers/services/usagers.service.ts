import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  usagerLightRepository,
  usagerRepository,
  UsagerTable,
} from "../../database";
import { usagerHistoryRepository } from "../../database/services/usager/usagerHistoryRepository.service";

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
  UsagerDecision,
} from "../../_common/model";
import { usagerHistoryStateManager } from "./usagerHistoryStateManager.service";
import { usagersCreator } from "./usagersCreator.service";
import { usagerVisibleHistoryManager } from "./usagerVisibleHistoryManager.service";

import { CreateUsagerDto, DecisionDto, RdvDto } from "../dto";

import { subMinutes } from "date-fns";

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
      uuid: uuidv4(),
      dateDecision: now,
      statut: "INSTRUCTION",
      userName: user.prenom + " " + user.nom,
      userId: user.id,
      dateFin: now,
      dateDebut: now,
      typeDom: "PREMIERE_DOM",
    };

    usager.historique.push(usager.decision);

    usager.structureId = user.structureId;
    usager.etapeDemande = ETAPE_RENDEZ_VOUS;
    usager.typeDom = "PREMIERE_DOM";

    const createdUsager = (await usagerLightRepository.save(
      usager
    )) as UsagerLight;

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
    update: Partial<UsagerTable>
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

    usager.typeDom = typeDom;
    let newDateFin: Date | null = null;

    // Pour les renouvellements de dossier encore valide, on reprend l'actuelle date de fin
    if (usager.decision.statut === "VALIDE") {
      newDateFin = usager.decision.dateFin
        ? new Date(usager.decision.dateFin)
        : new Date();
    }

    usager.decision = {
      uuid: uuidv4(),
      dateDebut: now,
      dateDecision: now,
      dateFin: newDateFin,
      statut: "INSTRUCTION",
      userId: user.id,
      userName: user.prenom + " " + user.nom,
      typeDom,
      motif: null,
    };

    // Ajout du précédent état dans l'historique
    usagerVisibleHistoryManager.addDecisionToVisibleHistory({ usager });

    usager.options.npai = {
      actif: false,
      dateDebut: null,
    };

    usager.etapeDemande = ETAPE_ETAT_CIVIL;
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
    usager: UsagerLight,
    decision: DecisionDto
  ): Promise<UsagerLight> {
    // Adaptation de la timeZone
    const now = new Date();
    decision.dateDecision = now;

    usager.etapeDemande = ETAPE_DOSSIER_COMPLET;

    if (decision.statut === "ATTENTE_DECISION") {
      usager.etapeDemande = ETAPE_DECISION;
    }

    if (decision.statut === "REFUS" || decision.statut === "RADIE") {
      decision.dateFin =
        decision.dateFin !== undefined && decision.dateFin !== null
          ? // Fin de la journée pour la date de fin
            decision.dateFin
          : now;
      decision.dateDebut = decision.dateFin;
    }

    // Valide
    if (decision.statut === "VALIDE") {
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

      // Date de premiere dom = date de début si aucune autre date n'est spécifiée
      if (!usager.datePremiereDom) {
        usager.datePremiereDom = decision.dateDebut;
      }
    }

    usager.decision = decision as UsagerDecision;
    usager.decision.uuid = uuidv4();

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
      { uuid: usager.uuid },
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
    usager: UsagerLight,
    rdv: RdvDto,
    user: UserStructureProfile
  ): Promise<UsagerLight> {
    usager.rdv = {
      userId: rdv.userId,
      userName: user.prenom + " " + user.nom,
      dateRdv: rdv.dateRdv,
    };

    if (rdv.isNow) {
      usager.etapeDemande = ETAPE_ENTRETIEN;
      usager.rdv.dateRdv = subMinutes(new Date(), 1);
    } else {
      usager.etapeDemande = ETAPE_RENDEZ_VOUS;
    }

    usager = await usagerLightRepository.updateOne(
      { uuid: usager.uuid },
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
    return usagerRepository.findBy({ structureId });
  }
}
