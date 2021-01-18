import { Injectable } from "@nestjs/common";
import { structureCommonRepository, structureRepository } from "../../database";
import {
  StructureCommon,
  STRUCTURE_COMMON_ATTRIBUTES,
} from "../../_common/model";
import { Structure } from "../structure-interface";

@Injectable()
export class StructureHardResetService {
  constructor() {}

  public async checkHardResetToken(
    userId: number,
    token: string
  ): Promise<StructureCommon & Pick<Structure, "hardReset">> {
    const select: (keyof StructureCommon &
      Pick<
        Structure,
        "hardReset"
      >)[] = (STRUCTURE_COMMON_ATTRIBUTES as any[]).concat(["hardReset"]);

    return structureRepository.findOneWithQuery<
      StructureCommon & Pick<Structure, "hardReset">
    >({
      select: select,
      where: `"hardReset" @> '{"token": :token, "userId": :userId}'`,
      params: {
        userId,
        token,
      },
    });
  }
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
