import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  usagerEntretienRepository,
  usagerRepository,
  UsagerTable,
} from "../../database";
import { UserStructureAuthenticated } from "../../_common/model";

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
  UsagersFilterCriteriaStatut,
  UserStructure,
  UserStructureProfile,
} from "@domifa/common";
import { UsagerHistoryStateService } from "./usagerHistoryState.service";
import { StructureUsagerExport } from "./xlsx-structure-usagers-renderer";
import { getPhoneString } from "../../util";

@Injectable()
export class UsagersService {
  constructor(
    private readonly usagerHistoryStateService: UsagerHistoryStateService
  ) {}
  public async create(
    usagerDto: CreateUsagerDto,
    user: Pick<UserStructureProfile, "id" | "structureId" | "prenom" | "nom">
  ): Promise<Usager> {
    const usager = new UsagerTable(usagerDto);
    usagersCreator.setUsagerDefaultAttributes(usager);
    const now = new Date();

    usager.etapeDemande = ETAPE_RENDEZ_VOUS;
    usager.ref = await usagersCreator.findNextUsagerRef(user.structureId);
    usager.customRef = `${usager.ref}`;

    usager.telephone = {
      countryCode: usagerDto?.telephone?.countryCode ?? "fr",
      numero: getPhoneString(usagerDto.telephone).replace(/\s+/g, ""),
    };

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

  public async exportByChunks(
    user: Pick<UserStructureAuthenticated, "id" | "structureId" | "prenom">,
    chunkSize: number = 5000,
    statut: UsagersFilterCriteriaStatut,
    processChunk: (
      chunk: StructureUsagerExport[],
      count: number
    ) => Promise<void>
  ): Promise<void> {
    let skip = 0;
    let total = 0;

    let whereClause = 'WHERE u."structureId" = $1';
    let countWhereClause = `${whereClause}`;
    const countParams: any[] = [user.structureId];

    if (statut !== UsagersFilterCriteriaStatut.TOUS) {
      countWhereClause += ` AND u.statut = $2`;
      whereClause += ` AND u.statut = $4`;
      countParams.push(statut);
    }

    const countQuery = `
    SELECT COUNT(*) as count
    FROM usager u
    ${countWhereClause}
  `;

    const [{ count }] = await usagerRepository.query(countQuery, countParams);

    const query = `
    SELECT
      u."customRef",
      u.ref,
      u.nom,
      u.prenom,
      u.surnom,
      u.sexe,
      u."dateNaissance",
      u."villeNaissance",
      u.langue,
      u.nationalite,
      u.email,
      u.telephone,
      u."ayantsDroits",
      u."typeDom",
      u."datePremiereDom",
      u.decision,
      u.historique,
      u."lastInteraction",
      u.options,
      u."numeroDistribution",
      u."referrerId",
      JSON_BUILD_OBJECT(
        'usagerUUID', e."usagerUUID",
        'structureId', e."structureId",
        'usagerRef', e."usagerRef",
        'domiciliation', e.domiciliation,
        'commentaires', e.commentaires,
        'typeMenage', e."typeMenage",
        'revenus', e.revenus,
        'revenusDetail', e."revenusDetail",
        'orientation', e.orientation,
        'orientationDetail', e."orientationDetail",
        'liencommune', e.liencommune,
        'liencommuneDetail', e."liencommuneDetail",
        'residence', e.residence,
        'residenceDetail', e."residenceDetail",
        'cause', e.cause,
        'causeDetail', e."causeDetail",
        'rattachement', e.rattachement,
        'raison', e.raison,
        'raisonDetail', e."raisonDetail",
        'accompagnement', e.accompagnement,
        'accompagnementDetail', e."accompagnementDetail",
        'situationPro', e."situationPro",
        'situationProDetail', e."situationProDetail"
      ) as entretien
    FROM usager u
    LEFT JOIN usager_entretien e ON e."usagerUUID" = u.uuid
    ${whereClause}
    ORDER BY u.nom ASC
    LIMIT $2 OFFSET $3
  `;

    while (total < count) {
      const queryParams: any[] = [user.structureId, chunkSize, skip];
      if (statut !== UsagersFilterCriteriaStatut.TOUS) {
        queryParams.push(statut);
      }

      const chunk = await usagerRepository.query(query, queryParams);

      if (chunk.length === 0) {
        break;
      }

      await processChunk(chunk, total);
      total += chunk.length;
      skip += chunk.length;

      console.table({
        totalCount: `${total}/${parseInt(count, 10)}`,
        progression: `${Math.round((total / parseInt(count, 10)) * 100)}%`,
        chunkSize: chunk.length,
        skip,
        userId: user.id,
        structureId: user.structureId,
      });

      chunk.length = 0;
    }

    if (total !== parseInt(count)) {
      console.log(
        `⚠️ Différence détectée - Exportés: ${total}, Total attendu: ${count}`
      );
    }
  }
}
