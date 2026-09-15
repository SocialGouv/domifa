import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { In } from "typeorm";

import {
  acquireAdvisoryXactLock,
  myDataSource,
  usagerLienRepository,
  usagerLienSuggestionRejeteeRepository,
  usagerRepository,
  UsagerLienSuggestionRejeteeTable,
  UsagerLienTable,
  UsagerTable,
  joinSelectFields,
} from "../../database";
import {
  Usager,
  UsagerDecisionStatut,
  UsagerLienSearchResult,
  UsagerLienSuggestion,
  UsagerLienSummary,
  UsagerLienType,
  UserStructureResume,
} from "@domifa/common";
import { scoreNamePair } from "../utils/usager-lien/usagerLienScoring";
import { USAGER_LIEN_MATCH_SCORE_THRESHOLD } from "../constants/USAGER_LIEN_MATCHING.const";

// Priorité utilisée pour départager plusieurs candidats à score de matching
// égal : dossier actif d'abord, radié/refusé en dernier (voir §3 du plan
// "candidats multiples").
const STATUT_RANK: Record<UsagerDecisionStatut, number> = {
  VALIDE: 0,
  INSTRUCTION: 1,
  ATTENTE_DECISION: 2,
  REFUS: 3,
  RADIE: 3,
};

interface UsagerRefLight {
  uuid: string;
  ref: number;
  customRef: string | null;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  statut: UsagerDecisionStatut;
}

function toRefLight(usager: Usager): UsagerRefLight {
  return {
    uuid: usager.uuid,
    ref: usager.ref,
    customRef: usager.customRef ?? null,
    nom: usager.nom,
    prenom: usager.prenom,
    dateNaissance: usager.dateNaissance,
    statut: usager.statut,
  };
}

const isUniqueViolation = (error: unknown): boolean =>
  (error as { code?: string })?.code === "23505";

@Injectable()
export class UsagerLienService {
  public async getLien(usagerUuid: string): Promise<UsagerLienSummary | null> {
    const lien = await usagerLienRepository.findOneBy({
      usagerUUID: usagerUuid,
    });
    if (!lien) {
      return null;
    }

    const linked = await usagerRepository.findOneBy({
      uuid: lien.linkedUsagerUUID,
    });
    if (!linked) {
      return null;
    }

    return {
      type: lien.type,
      createdAt: lien.createdAt,
      linkedUsager: toRefLight(linked),
    };
  }

  public async link(params: {
    currentUsager: Usager;
    targetUsagerUuid: string;
    type: UsagerLienType;
    createdBy: UserStructureResume;
  }): Promise<UsagerLienSummary> {
    const { currentUsager, targetUsagerUuid, type, createdBy } = params;

    if (targetUsagerUuid === currentUsager.uuid) {
      throw new BadRequestException("CANNOT_LINK_TO_SELF");
    }

    return myDataSource.transaction(async (manager) => {
      // Sérialise les tentatives concurrentes de lier la même paire (dans
      // les deux sens) pendant la durée de la transaction.
      const lockKey = [currentUsager.uuid, targetUsagerUuid].sort().join(":");
      await acquireAdvisoryXactLock(manager, `usager-lien:${lockKey}`);

      const target = await manager.findOneBy(UsagerTable, {
        uuid: targetUsagerUuid,
      });
      if (!target) {
        throw new BadRequestException("TARGET_NOT_FOUND");
      }

      // Ne jamais faire confiance à un structureId envoyé par le client : on
      // compare le structureId réel du dossier courant (résolu par
      // UsagerAccessGuard à partir du JWT) à celui de la cible.
      if (target.structureId !== currentUsager.structureId) {
        throw new BadRequestException("CROSS_STRUCTURE_LINK_FORBIDDEN");
      }

      const existing = await manager.find(UsagerLienTable, {
        where: { usagerUUID: In([currentUsager.uuid, targetUsagerUuid]) },
      });
      if (existing.length > 0) {
        throw new ConflictException("ALREADY_LINKED");
      }

      try {
        await manager.insert(UsagerLienTable, [
          {
            usagerUUID: currentUsager.uuid,
            linkedUsagerUUID: targetUsagerUuid,
            type,
            structureId: currentUsager.structureId,
            createdBy,
          },
          {
            usagerUUID: targetUsagerUuid,
            linkedUsagerUUID: currentUsager.uuid,
            type,
            structureId: currentUsager.structureId,
            createdBy,
          },
        ]);
      } catch (error) {
        // Filet de sécurité DB (contrainte UNIQUE("usagerUUID")) pour toute
        // course non couverte par le lock applicatif ci-dessus.
        if (isUniqueViolation(error)) {
          throw new ConflictException("ALREADY_LINKED");
        }
        throw error;
      }

      return {
        type,
        createdAt: new Date(),
        linkedUsager: toRefLight(target as Usager),
      };
    });
  }

  public async unlink(params: {
    currentUsager: Usager;
  }): Promise<{ linkedUsagerUuid: string }> {
    const { currentUsager } = params;

    return myDataSource.transaction(async (manager) => {
      const lien = await manager.findOneBy(UsagerLienTable, {
        usagerUUID: currentUsager.uuid,
      });
      if (!lien) {
        throw new NotFoundException("NO_LINK");
      }

      await manager.delete(UsagerLienTable, {
        usagerUUID: In([currentUsager.uuid, lien.linkedUsagerUUID]),
      });

      return { linkedUsagerUuid: lien.linkedUsagerUUID };
    });
  }

  public async findSuggestion(params: {
    currentUsager: Usager;
  }): Promise<UsagerLienSuggestion | null> {
    const { currentUsager } = params;

    // Un dossier déjà relié n'a plus besoin de suggestion (1-1 strict) :
    // c'est ce qui fait disparaître la suggestion côté formulaire une fois
    // la liaison faite, sans dépendre du frontend pour ne pas l'appeler.
    const existingLien = await usagerLienRepository.findOneBy({
      usagerUUID: currentUsager.uuid,
    });
    if (existingLien) {
      return null;
    }

    const rejected = await usagerLienSuggestionRejeteeRepository.find({
      where: { usagerUUID: currentUsager.uuid },
    });
    const rejectedAyantDroitUuids = new Set(
      rejected.map((r) => r.ayantDroitUUID)
    );

    const ayantDroit = (currentUsager.ayantsDroits ?? []).find(
      (a) => a.lien === "CONJOINT" && !rejectedAyantDroitUuids.has(a.uuid)
    );
    if (!ayantDroit || !ayantDroit.dateNaissance) {
      return null;
    }

    const candidates = await usagerRepository
      .createQueryBuilder("usager")
      .where(
        `"structureId" = :structureId AND "uuid" != :excludeUuid AND DATE("dateNaissance") = DATE(:dateNaissance)`,
        {
          structureId: currentUsager.structureId,
          excludeUuid: currentUsager.uuid,
          dateNaissance: ayantDroit.dateNaissance,
        }
      )
      .getMany();

    const scored = candidates
      .map((candidate) => ({
        candidate,
        score: scoreNamePair(ayantDroit, candidate),
      }))
      .filter(({ score }) => score >= USAGER_LIEN_MATCH_SCORE_THRESHOLD);

    if (scored.length === 0) {
      return null;
    }

    scored.sort((a, b) => {
      const rankDiff =
        STATUT_RANK[a.candidate.statut] - STATUT_RANK[b.candidate.statut];
      if (rankDiff !== 0) {
        return rankDiff;
      }
      return (
        new Date(b.candidate.createdAt).getTime() -
        new Date(a.candidate.createdAt).getTime()
      );
    });

    const winner = scored[0].candidate;

    return {
      ayantDroitUuid: ayantDroit.uuid,
      candidate: {
        uuid: winner.uuid,
        ref: winner.ref,
        customRef: winner.customRef ?? null,
        nom: winner.nom,
        prenom: winner.prenom,
        dateNaissance: winner.dateNaissance,
        statut: winner.statut,
      },
      alreadyLinkedTo: await this.resolveAlreadyLinkedTo(winner.uuid),
    };
  }

  public async search(params: {
    currentUsager: Usager;
    query: string;
  }): Promise<UsagerLienSearchResult[]> {
    const { currentUsager, query } = params;

    const results = await usagerRepository
      .createQueryBuilder("usager")
      .select(
        joinSelectFields([
          "uuid",
          "nom",
          "prenom",
          "dateNaissance",
          "customRef",
        ])
      )
      .where(
        `"structureId" = :structureId AND "uuid" != :excludeUuid AND (nom ILIKE :q OR prenom ILIKE :q OR "customRef" ILIKE :q OR CAST(ref AS TEXT) ILIKE :q)`,
        {
          structureId: currentUsager.structureId,
          excludeUuid: currentUsager.uuid,
          q: `%${query}%`,
        }
      )
      .limit(10)
      .getRawMany<{
        uuid: string;
        nom: string;
        prenom: string;
        dateNaissance: Date;
        customRef: string | null;
      }>();

    if (results.length === 0) {
      return [];
    }

    const uuids = results.map((r) => r.uuid);
    const liens = await usagerLienRepository.find({
      where: { usagerUUID: In(uuids) },
    });

    const linkedUuids = liens.map((l) => l.linkedUsagerUUID);
    const linkedUsagers = linkedUuids.length
      ? await usagerRepository.find({
          where: { uuid: In(linkedUuids) },
        })
      : [];

    const alreadyLinkedToByUuid = new Map<
      string,
      { nom: string; prenom: string }
    >();
    for (const lien of liens) {
      const linked = linkedUsagers.find(
        (u) => u.uuid === lien.linkedUsagerUUID
      );
      if (linked) {
        alreadyLinkedToByUuid.set(lien.usagerUUID, {
          nom: linked.nom,
          prenom: linked.prenom,
        });
      }
    }

    return results.map((r) => ({
      uuid: r.uuid,
      nom: r.nom,
      prenom: r.prenom,
      dateNaissance: r.dateNaissance,
      customRef: r.customRef ?? null,
      alreadyLinkedTo: alreadyLinkedToByUuid.get(r.uuid) ?? null,
    }));
  }

  public async rejectSuggestion(params: {
    currentUsager: Usager;
    ayantDroitUuid: string;
    createdBy: UserStructureResume;
  }): Promise<void> {
    const { currentUsager, ayantDroitUuid, createdBy } = params;

    await myDataSource
      .createQueryBuilder()
      .insert()
      .into(UsagerLienSuggestionRejeteeTable)
      .values({
        usagerUUID: currentUsager.uuid,
        ayantDroitUUID: ayantDroitUuid,
        structureId: currentUsager.structureId,
        createdBy,
      })
      .orIgnore()
      .execute();
  }

  private async resolveAlreadyLinkedTo(
    usagerUuid: string
  ): Promise<{ nom: string; prenom: string } | null> {
    const lien = await usagerLienRepository.findOneBy({
      usagerUUID: usagerUuid,
    });
    if (!lien) {
      return null;
    }

    const linked = await usagerRepository.findOneBy({
      uuid: lien.linkedUsagerUUID,
    });
    return linked ? { nom: linked.nom, prenom: linked.prenom } : null;
  }
}
