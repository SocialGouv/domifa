import { Injectable } from "@nestjs/common";

import { UsagerOptionsHistoryTable } from "../../database/entities";
import { usagerOptionsHistoryRepository } from "../../database/services";
import { CreateUsagerOptionsHistoryDto } from "../dto/createUsagerOptionsHistory.dto";

@Injectable()
export class UsagerOptionsHistoryService {
  public async create(usagerOptionsHistoryDto: CreateUsagerOptionsHistoryDto) {
    const newUsagerOptionsHistory = new UsagerOptionsHistoryTable(
      usagerOptionsHistoryDto
    );

    return await usagerOptionsHistoryRepository.save(newUsagerOptionsHistory);
  }
}
