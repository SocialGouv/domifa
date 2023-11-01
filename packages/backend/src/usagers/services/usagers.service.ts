import { usagerEntretienRepository } from "./../../database/services/usager/usagerEntretienRepository.service";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { usagerRepository, UsagerTable } from "../../database";
import { usagerHistoryRepository } from "../../database/services/usager/usagerHistoryRepository.service";

import {
  Usager,
  UserStructure,
  UserStructureProfile,
  UsagerTypeDom,
  UsagerDecision,
  UserStructureAuthenticated,
} from "../../_common/model";
import { usagerHistoryStateManager } from "./usagerHistoryStateManager.service";
import { usagersCreator } from "./usagersCreator.service";
import { usagerVisibleHistoryManager } from "./usagerVisibleHistoryManager.service";

import { CreateUsagerDto, DecisionDto, RdvDto } from "../dto";

import { subMinutes } from "date-fns";
import {
  ETAPE_RENDEZ_VOUS,
  ETAPE_ETAT_CIVIL,
  ETAPE_DOSSIER_COMPLET,
  ETAPE_DECISION,
  ETAPE_ENTRETIEN,
} from "@domifa/common";

@Injectable()
export class UsagersService {
  public async create(
    usagerDto: CreateUsagerDto,
    user: UserStructureProfile
  ): Promise<Usager> {
    const usager = new UsagerTable(usagerDto);
    usagersCreator.setUsagerDefaultAttributes(usager);
    const now = new Date();

    usager.etapeDemande = ETAPE_RENDEZ_VOUS;
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

    const createdUsager = await usagerRepository.save(usager);

    usager.entretien = await usagerEntretienRepository.save({
      structureId: usager.structureId,
      usagerUUID: usager.uuid,
      usagerRef: usager.ref,
    });

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

  public async renouvellement(
    usager: Usager,
    user: Pick<UserStructure, "id" | "nom" | "prenom" | "structure">
  ): Promise<Usager> {
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

    return usagerRepository.updateOneAndReturn(usager.uuid, {
      lastInteraction: usager.lastInteraction,
      decision: usager.decision,
      options: usager.options,
      historique: usager.historique,
      etapeDemande: usager.etapeDemande,
      typeDom,
      rdv: usager.rdv,
    });
  }

  public async setDecision(
    usager: Usager,
    newDecision: DecisionDto
  ): Promise<Usager> {
    const now = new Date();
    newDecision.dateDecision = now;
    usager.etapeDemande = ETAPE_DOSSIER_COMPLET;

    if (newDecision.statut === "ATTENTE_DECISION") {
      usager.etapeDemande = ETAPE_DECISION;
    }

    if (newDecision.statut === "REFUS" || newDecision.statut === "RADIE") {
      newDecision.dateFin = newDecision?.dateFin ? newDecision.dateFin : now;
      newDecision.dateDebut = newDecision.dateFin;
    }

    // Valide
    if (newDecision.statut === "VALIDE") {
      const actualLastInteraction = new Date(
        usager.lastInteraction.dateInteraction
      );

      // Si la dom est valide après le dernier passage, on le met à jour
      if (newDecision.dateDebut > actualLastInteraction) {
        usager.lastInteraction.dateInteraction = newDecision.dateDebut;
      }

      // ID personnalisé
      if (newDecision.customRef) {
        usager.customRef = newDecision.customRef;
      }

      // Date de premiere dom = date de début si aucune autre date n'est spécifiée
      if (!usager.datePremiereDom) {
        usager.datePremiereDom = newDecision.dateDebut;
      }
    }

    usager.decision = newDecision as UsagerDecision;
    usager.decision.uuid = uuidv4();
    usagerVisibleHistoryManager.addDecisionToVisibleHistory({ usager });

    await usagerHistoryStateManager.updateHistoryStateFromDecision({
      usager,
      createdAt: usager.decision.dateDecision,
      createdEvent: "new-decision",
      historyBeginDate: usager.decision.dateDebut,
    });

    return usagerRepository.updateOneAndReturn(usager.uuid, {
      lastInteraction: usager.lastInteraction,
      customRef: usager.customRef,
      decision: usager.decision,
      historique: usager.historique,
      etapeDemande: usager.etapeDemande,
      typeDom: usager.typeDom,
      datePremiereDom: usager.datePremiereDom,
    });
  }

  public async setRdv(
    usager: Usager,
    rdv: RdvDto,
    user: Pick<UserStructureAuthenticated, "id" | "prenom" | "nom" | "email">
  ): Promise<Usager> {
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

    return usagerRepository.updateOneAndReturn(usager.uuid, {
      rdv: usager.rdv,
      etapeDemande: usager.etapeDemande,
    });
  }

  public async export(structureId: number): Promise<Usager[]> {
    return usagerRepository.find({
      where: { structureId },
      relations: {
        entretien: true,
      },
    });
  }
}
