import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  interactionRepository,
  InteractionsTable,
  usagerRepository,
} from "../../database";
import { SmsService } from "../../sms/services/sms.service";
import { UsagersService } from "../../usagers/services/usagers.service";
import { AppUser, Usager } from "../../_common/model";
import { Interactions, InteractionType } from "../../_common/model/interaction";

@Injectable()
export class InteractionsDeletor {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly smsService: SmsService
  ) {}

  public async deleteInteraction({
    interactionId,
    usagerRef,
    user,
  }: {
    interactionId: number;
    usagerRef: number;
    user: Pick<AppUser, "structureId" | "id" | "nom" | "prenom">;
  }) {
    const usager = await usagerRepository.findOne({
      structureId: user.structureId,
      ref: usagerRef,
    });

    const interactionToDelete = await interactionRepository.findOne({
      id: interactionId,
      structureId: user.structureId,
      usagerRef,
    });

    if (!interactionToDelete || interactionToDelete === null) {
      throw new HttpException("INTERACTION_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    if (interactionToDelete.type === "npai") {
      usager.options.npai.actif = false;
      usager.options.npai.dateDebut = null;

      const delInteraction = await this._deleteOrRestore({
        user,
        interactionToDelete,
      });

      if (delInteraction) {
        return this.usagersService.patch({ uuid: usager.uuid }, usager);
      }
    }

    const len = interactionToDelete.type.length;

    const interactionOut =
      interactionToDelete.type.substring(len - 3) ===
      ("Out" as unknown as InteractionType);

    const interactionIn =
      interactionToDelete.type.substring(len - 2) ===
      ("In" as unknown as InteractionType);

    if (interactionIn) {
      // Suppression du SMS en file d'attente
      const smsToDelete = await this.smsService.deleteSmsInteraction(
        usager,
        user.structureId,
        interactionToDelete
      );

      const inType = (interactionToDelete.type.substring(0, len - 2) +
        "Out") as unknown as InteractionType;

      const last = await interactionRepository.findLastInteraction({
        usagerRef: usager.ref,
        dateInteraction: interactionToDelete.dateInteraction,
        typeInteraction: inType,
        user,
        isIn: "in",
        event: "create",
      });

      if (!last || last === null) {
        if (interactionToDelete.nbCourrier) {
          usager.lastInteraction[interactionToDelete.type] =
            usager.lastInteraction[interactionToDelete.type] -
            interactionToDelete.nbCourrier;
        }
      }
    } else if (interactionOut) {
      const inType = interactionToDelete.type.substring(0, len - 3) + "In";

      if (interactionToDelete.nbCourrier) {
        usager.lastInteraction[inType] =
          usager.lastInteraction[inType] + interactionToDelete.nbCourrier;
      }
    }

    const deletedInteraction = await this._deleteOrRestore({
      user,
      interactionToDelete,
    });

    if (deletedInteraction === null || !deletedInteraction) {
      throw new HttpException(
        "INTERACTION_DELETE_IMPOSSIBLE",
        HttpStatus.BAD_REQUEST
      );
    }

    return await this.updateUsagerLastInteraction(user, usager);
  }

  private async _deleteOrRestore({
    interactionToDelete,
    user,
  }: {
    interactionToDelete: Interactions;
    user: Pick<AppUser, "structureId" | "id" | "nom" | "prenom">;
  }) {
    if (interactionToDelete.event === "create") {
      // create a "delete" interaction
      await this._createDeleteInteraction({
        user,
        interactionToDelete,
      });
    } else {
      // restore deleted interaction
      await this._restoreDeleteInteraction({
        interactionToDelete,
      });
    }
    // delete interaction
    const retour = interactionRepository.deleteByCriteria({
      id: interactionToDelete.id,
      structureId: user.structureId,
      usagerRef: interactionToDelete.usagerRef,
    });

    if (!retour || retour === null) {
      throw new HttpException("CANNOT_DELETE_INTERACTION", 500);
    }
    return retour;
  }

  private _createDeleteInteraction({
    user,
    interactionToDelete,
  }: {
    user: Pick<AppUser, "structureId" | "id" | "nom" | "prenom">;
    interactionToDelete: Interactions;
  }) {
    const deleteInteraction = new InteractionsTable({
      ...interactionToDelete,
      uuid: undefined, // generate new uuid
      structureId: user.structureId,
      userId: user.id,
      userName: user.prenom + " " + user.nom,
      dateInteraction: new Date(),
      event: "delete",
      previousValue: interactionToDelete,
    });

    return interactionRepository.save(deleteInteraction);
  }

  private _restoreDeleteInteraction({
    interactionToDelete,
  }: {
    interactionToDelete: Interactions;
  }) {
    const deleteInteraction = new InteractionsTable(
      interactionToDelete.previousValue
    );

    return interactionRepository.save(deleteInteraction);
  }
  private async updateUsagerLastInteraction(
    user: Pick<AppUser, "structureId" | "nom" | "prenom" | "id">,
    usager: Usager
  ) {
    // Recherche de la dernière date de passage

    const lastInteraction = await interactionRepository.findLastInteractionOk({
      user,
      usager,
      event: "create",
    });
    const lastInteractionDate = lastInteraction?.dateInteraction;

    if (lastInteractionDate) {
      // Si la date de la dernière décision a lieu après la dernière interaction, on l'assigne à lastInteraction.dateInteraction
      usager.lastInteraction.dateInteraction =
        lastInteractionDate > new Date(usager.decision.dateDecision)
          ? lastInteractionDate
          : usager.decision.dateDecision;
    } else {
      usager.lastInteraction.dateInteraction = usager.decision.dateDecision;
    }

    usager.lastInteraction.enAttente =
      usager.lastInteraction.courrierIn > 0 ||
      usager.lastInteraction.colisIn > 0 ||
      usager.lastInteraction.recommandeIn > 0;
    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }
}
