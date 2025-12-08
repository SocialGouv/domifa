import { Injectable, BadRequestException } from "@nestjs/common";
import {
  structureRepository,
  userStructureRepository,
  usagerDocsRepository,
  usagerHistoryStatesRepository,
  usagerRepository,
  messageSmsRepository,
} from "../../../../database";
import {
  StructureDecisionRefusMotif,
  StructureDecisionSuppressionMotif,
  StructureDecisionStatut,
  Structure,
} from "@domifa/common";

import { UserAdminAuthenticated } from "../../../../_common/model";
import {
  appLogger,
  cleanPath,
  FileManagerService,
  getCreatedByUserStructure,
} from "../../../../util";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { domifaConfig } from "../../../../config";
import { join } from "path";
import { LogAction } from "../../../app-logs/types";
import { getStructureDecisionMotif } from "../get-structure-decision-motif";

interface MotifConfig {
  motifEnum?: Record<string, string>;
  logAction: LogAction;
}

@Injectable()
export class StructureDecisionService {
  private readonly statutConfigs: Record<StructureDecisionStatut, MotifConfig> =
    {
      EN_ATTENTE: {
        logAction: "ADMIN_STRUCTURE_CREATION",
      },
      REFUS: {
        motifEnum: StructureDecisionRefusMotif,
        logAction: "ADMIN_STRUCTURE_REFUSAL",
      },
      SUPPRIME: {
        motifEnum: StructureDecisionSuppressionMotif,
        logAction: "ADMIN_STRUCTURE_DELETE",
      },
      VALIDE: {
        logAction: "ADMIN_STRUCTURE_VALIDATE",
      },
    };

  constructor(
    private readonly fileManagerService: FileManagerService,
    private readonly brevoSenderService: BrevoSenderService
  ) {}

  validateMotif(
    statut: StructureDecisionStatut,
    motif?: StructureDecisionRefusMotif | StructureDecisionSuppressionMotif
  ): { isValid: boolean; motifLabel: string } {
    if (!motif) {
      return { isValid: true, motifLabel: "" };
    }
    const config = this.statutConfigs[statut];

    if (!config.motifEnum) {
      return { isValid: true, motifLabel: "" };
    }

    const isValidMotif = Object.values(config.motifEnum).includes(motif as any);

    if (!isValidMotif) {
      throw new BadRequestException("INVALID_STRUCTURE_STATUT");
    }

    const motifLabel = getStructureDecisionMotif(statut, motif);
    return { isValid: true, motifLabel };
  }

  buildDecisionObject(
    statut: StructureDecisionStatut,
    statutDetail: string | undefined,
    user: UserAdminAuthenticated
  ) {
    return {
      statut,
      dateDecision: new Date(),
      motif: statutDetail,
      ...getCreatedByUserStructure(user),
    };
  }

  async updateStructureStatut(
    structureId: number,
    statut: StructureDecisionStatut,
    decision: any
  ): Promise<void> {
    await structureRepository.update(
      { id: structureId },
      {
        statut,
        decision,
      }
    );
  }

  async getStructureAdmin(structureId: number) {
    const admin = await userStructureRepository.findOneBy({
      role: "admin",
      structureId,
    });

    if (!admin) {
      throw new BadRequestException("ADMIN_NOT_FOUND");
    }

    return admin;
  }

  async deleteStructureData(
    structure: Pick<Structure, "id" | "uuid">
  ): Promise<void> {
    const structureId = structure.id;
    const users = await userStructureRepository.find({
      where: { structureId: structure.id },
      select: { email: true },
    });

    // Delete from Brevo
    await Promise.all(
      users.map((user) =>
        this.deleteContactFromBrevo(user.email).catch((error) => {
          appLogger.warn(
            `Impossible de supprimer le contact Brevo ${user.email} pour la structure ${structureId}`,
            error
          );
        })
      )
    );

    // Delete all files
    const key = `${join(
      domifaConfig().upload.bucketRootDir,
      "usager-documents",
      cleanPath(structure.uuid)
    )}/`;

    await this.fileManagerService.deleteAllUnderStructure(key);

    // Delete in database all information
    await Promise.all([
      userStructureRepository.delete({ structureId }),
      usagerDocsRepository.delete({ structureId }),
      usagerRepository.delete({ structureId }),
      messageSmsRepository.delete({ structureId }),
      usagerHistoryStatesRepository.delete({ structureId }),
    ]);
  }

  private async deleteContactFromBrevo(email: string): Promise<void> {
    try {
      await this.brevoSenderService.deleteContactFromBrevo(email);
      appLogger.info(`Contact Brevo supprimé pour l'email ${email}`);
    } catch (error) {
      appLogger.warn(
        `Erreur lors de la suppression du contact Brevo pour l'email ${email}`,
        error
      );
      throw error;
    }
  }

  async activateAdmin(adminId: number, structureId: number): Promise<void> {
    await userStructureRepository.update(
      {
        id: adminId,
        structureId,
      },
      { verified: true }
    );
  }

  getStatutConfig(statut: StructureDecisionStatut): MotifConfig {
    return this.statutConfigs[statut];
  }
}
