import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  usagerEntretienRepository,
  usagerRepository,
  UsagerTable,
} from "../../database";
import {
  UserStructure,
  UserStructureProfile,
  UserStructureAuthenticated,
} from "../../_common/model";

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
  UsagerTypeDom,
  UsagerDecision,
  Usager,
} from "@domifa/common";
import { UsagerHistoryStateService } from "./usagerHistoryState.service";
import { StructureUsagerExport } from "./xlsx-structure-usagers-renderer";

@Injectable()
export class UsagersService {
  constructor(
    private readonly usagerHistoryStateService: UsagerHistoryStateService
  ) {}
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
      userName: `${user.prenom} ${user.nom}`,
      userId: user.id,
      dateFin: now,
      dateDebut: now,
      typeDom: "PREMIERE_DOM",
    };
    usager.statut = usager.decision.statut;

    usager.historique.push(usager.decision);
    usager.structureId = user.structureId;

    const createdUsager = await usagerRepository.save(usager);

    usager.entretien = await usagerEntretienRepository.save({
      structureId: usager.structureId,
      usagerUUID: usager.uuid,
      usagerRef: usager.ref,
    });

    await this.usagerHistoryStateService.buildState({
      usager,
      createdAt: new Date(),
      createdEvent: "new-decision",
      historyBeginDate: createdUsager.decision.dateDebut,
    });

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
      userName: `${user.prenom} ${user.nom}`,
      typeDom,
      motif: null,
    };
    usager.statut = "INSTRUCTION";
    // Ajout du précédent état dans l'historique
    usagerVisibleHistoryManager.addDecisionToVisibleHistory({ usager });

    usager.options.npai = {
      actif: false,
      dateDebut: null,
    };

    usager.etapeDemande = ETAPE_ETAT_CIVIL;
    usager.rdv = null;

    await this.usagerHistoryStateService.buildState({
      usager,
      createdAt: new Date(),
      createdEvent: "new-decision",
      historyBeginDate: usager.decision.dateDebut,
    });

    usager.lastInteraction.dateInteraction = now;

    await usagerRepository.update(
      { uuid: usager.uuid },
      {
        lastInteraction: usager.lastInteraction,
        decision: usager.decision,
        statut: usager.decision.statut,
        options: usager.options,
        historique: usager.historique,
        etapeDemande: usager.etapeDemande,
        typeDom,
        rdv: usager.rdv,
      }
    );

    return usager;
  }

  public async setDecision(
    usager: Usager,
    newDecision: DecisionDto
  ): Promise<Usager> {
    const now = new Date();
    newDecision.dateDecision = now;
    usager.etapeDemande = ETAPE_DOSSIER_COMPLET;

    if (
      newDecision.statut === "ATTENTE_DECISION" ||
      newDecision.statut === "INSTRUCTION"
    ) {
      usager.etapeDemande = ETAPE_DECISION;
    } else if (
      newDecision.statut === "REFUS" ||
      newDecision.statut === "RADIE"
    ) {
      newDecision.dateFin = newDecision?.dateFin ? newDecision.dateFin : now;
      newDecision.dateDebut = newDecision.dateFin;
    } else if (newDecision.statut === "VALIDE") {
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
    usager.statut = usager.decision.statut;
    usager.decision.uuid = uuidv4();

    usagerVisibleHistoryManager.addDecisionToVisibleHistory({ usager });

    await this.usagerHistoryStateService.buildState({
      usager,
      createdAt: usager.decision.dateDecision,
      createdEvent: "new-decision",
      historyBeginDate: usager.decision.dateDebut,
    });

    await usagerRepository.update(
      { uuid: usager.uuid },
      {
        lastInteraction: usager.lastInteraction,
        customRef: usager.customRef,
        decision: usager.decision,
        statut: usager.statut,
        historique: usager.historique,
        etapeDemande: usager.etapeDemande,
        typeDom: usager.typeDom,
        datePremiereDom: usager.datePremiereDom,
      }
    );
    return usager;
  }

  public async setRdv(
    usager: Usager,
    rdv: RdvDto,
    user: Pick<UserStructureAuthenticated, "id" | "prenom" | "nom" | "email">
  ): Promise<Usager> {
    usager.rdv = {
      userId: rdv.userId,
      userName: `${user.prenom} ${user.nom}`,
      dateRdv: rdv.dateRdv,
    };

    if (rdv.isNow) {
      usager.etapeDemande = ETAPE_ENTRETIEN;
      usager.rdv.dateRdv = subMinutes(new Date(), 1);
    } else {
      usager.etapeDemande = ETAPE_RENDEZ_VOUS;
    }

    await usagerRepository.update(
      { uuid: usager.uuid },
      {
        rdv: usager.rdv,
        etapeDemande: usager.etapeDemande,
      }
    );
    return usager;
  }

  public async export(structureId: number): Promise<StructureUsagerExport[]> {
    return await usagerRepository.find({
      where: { structureId },
      relations: {
        entretien: true,
      },
      select: [
        "customRef",
        "ref",
        "nom",
        "prenom",
        "surnom",
        "sexe",
        "dateNaissance",
        "villeNaissance",
        "langue",
        "nationalite",
        "email",
        "telephone",
        "ayantsDroits",
        "typeDom",
        "datePremiereDom",
        "decision",
        "historique",
        "lastInteraction",
        "options",
        "numeroDistribution",
        "entretien",
      ],
    });
  }
}
