import { Injectable } from "@nestjs/common";

import { usagerOptionsHistoryRepository } from "../../database/services";
import {
  Usager,
  UserStructureAuthenticated,
  UsagerOptionsHistoryAction,
  UsagerOptionsHistoryType,
  UsagerOptionsHistory,
  UsagerOptionsProcuration,
  UsagerOptionsTransfert,
} from "../../_common/model";

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

    return await usagerOptionsHistoryRepository.save(newUsagerOptionsHistory);
  }
}
