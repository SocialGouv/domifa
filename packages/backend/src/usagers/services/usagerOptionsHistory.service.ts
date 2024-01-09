import { Injectable } from "@nestjs/common";

import { usagerOptionsHistoryRepository } from "../../database/services";
import { Usager, UserStructureAuthenticated } from "../../_common/model";
import { UsagerOptionsHistoryTable } from "../../database";
import {
  UsagerOptionsHistoryAction,
  UsagerOptionsHistoryType,
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
  UsagerOptionsHistory,
} from "@domifa/common";

@Injectable()
export class UsagerOptionsHistoryService {
  public async createOptionHistory(
    usager: Usager,
    user: UserStructureAuthenticated,
    action: UsagerOptionsHistoryAction,
    type: UsagerOptionsHistoryType,
    content: Partial<UsagerOptionsProcuration> & Partial<UsagerOptionsTransfert>
  ) {
    const newUsagerOptionsHistory: UsagerOptionsHistory = {
      usagerUUID: usager.uuid,
      userId: user.id,
      userName: `${user.prenom} ${user.nom}`,
      structureId: usager.structureId,
      action,
      type,
      nom: content?.nom ?? null,
      prenom: content?.prenom ?? null,
      actif: content?.actif ?? false,
      dateDebut: content?.dateDebut ?? null,
      dateFin: content?.dateFin ?? null,
      dateNaissance: content?.dateNaissance ?? null,
      adresse: content?.adresse ?? null,
    };

    return await usagerOptionsHistoryRepository.save(
      new UsagerOptionsHistoryTable(newUsagerOptionsHistory)
    );
  }
}
