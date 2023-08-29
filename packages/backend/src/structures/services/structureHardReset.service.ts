import { Injectable } from "@nestjs/common";
import { structureCommonRepository, structureRepository } from "../../database";

@Injectable()
export class StructureHardResetService {
  public async hardReset(
    id: number,
    token: {
      token: string;
      expireAt?: Date;
    }
  ) {
    return structureCommonRepository.updateOne({ id }, { hardReset: token });
  }

  public async hardResetClean(structureId: number): Promise<void> {
    await structureRepository.update(
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
