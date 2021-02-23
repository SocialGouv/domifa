import { Injectable } from "@nestjs/common";
import { structureCommonRepository } from "../../database";

@Injectable()
export class StructureHardResetService {
  constructor() {}

  public async hardReset(id: number, token: any) {
    return structureCommonRepository.updateOne({ id }, { hardReset: token });
  }

  public async hardResetClean(structureId: number) {
    return structureCommonRepository.updateOne(
      { id: structureId },
      {
        hardReset: {
          token: "",
          expireAt: null,
        },
      }
    );
  }
}
