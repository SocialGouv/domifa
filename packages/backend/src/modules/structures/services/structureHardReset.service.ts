import { Injectable } from "@nestjs/common";
import { structureRepository } from "../../../database";

@Injectable()
export class StructureHardResetService {
  public async hardReset(
    id: number,
    token: {
      token: string;
      expireAt?: Date;
    }
  ) {
    await structureRepository.update({ id }, { hardReset: token });
    return structureRepository.findOneBy({ id });
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
