import { Injectable } from "@nestjs/common";

import { UsagerOptionsHistoryTable } from "../../database/entities";
import { usagerOptionsHistoryRepository } from "../../database/services";
import { CreateUsagerOptionsHistoryDto } from "../dto/createUsagerOptionsHistory.dto";
import {
  UsagerLight,
  UserStructureAuthenticated,
  UsagerOptionsHistoriqueContent,
  UsagerOptionsHistoryAction,
  UsagerOptionsHistoryType,
} from "../../_common/model";

@Injectable()
export class UsagerOptionsHistoryService {
  public async createHistoryData(
    usager: UsagerLight,
    user: UserStructureAuthenticated,
    action: UsagerOptionsHistoryAction,
    type: UsagerOptionsHistoryType,
    content?: UsagerOptionsHistoriqueContent
  ) {
    const userData = {
      usagerUUID: usager.uuid,
      userId: user.id,
      userName: `${user.prenom} ${user.nom}`,
      structureId: usager.structureId,
      action,
      type,
      date: new Date(),
    };

    const contentData =
      action === "DELETE"
        ? {
            nom: "",
            prenom: "",
            actif: false,
            dateDebut: null,
            dateFin: null,
            dateNaissance: null,
            adresse: "",
          }
        : {
            nom: content.nom,
            prenom: content.prenom || "",
            actif: content.actif,
            dateDebut: content.dateDebut,
            dateFin: content.dateFin,
            dateNaissance: content.dateNaissance || null,
            adresse: content.adresse || "",
          };

    return await this.create({
      ...userData,
      ...contentData,
    });
  }

  public async create(usagerOptionsHistoryDto: CreateUsagerOptionsHistoryDto) {
    const newUsagerOptionsHistory = new UsagerOptionsHistoryTable(
      usagerOptionsHistoryDto
    );

    return await usagerOptionsHistoryRepository.save(newUsagerOptionsHistory);
  }
}
