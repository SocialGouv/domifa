import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { normalizeString } from "@domifa/common";
import { UsagerTable } from "./UsagerTable.typeorm";

@EventSubscriber()
export class UsagerSubscriber
  implements EntitySubscriberInterface<UsagerTable>
{
  listenTo() {
    return UsagerTable;
  }

  private processName(entity: UsagerTable) {
    if (!entity?.nom || !entity?.prenom) {
      return;
    }

    try {
      if (entity?.nom && entity?.prenom) {
        entity.nom = entity.nom.trim();
        entity.prenom = entity.prenom.trim();

        // Les ayants droit et les mandataires sont indexés ici parce que la
        // recherche de l'interface les parcourt déjà : trouver un dossier par
        // le prénom d'un enfant ou d'un mandataire fonctionne aujourd'hui, et
        // doit continuer à fonctionner une fois la recherche passée côté
        // serveur.
        const parts = [
          entity.nom,
          entity.prenom,
          entity.surnom,
          entity?.customRef ?? entity?.ref,
          ...(entity.ayantsDroits ?? []).flatMap((ayantDroit) => [
            ayantDroit?.nom,
            ayantDroit?.prenom,
          ]),
          ...(entity.options?.procurations ?? []).flatMap((procuration) => [
            procuration?.nom,
            procuration?.prenom,
          ]),
        ].filter(Boolean);

        entity.nom_prenom_surnom_ref = normalizeString(parts.join(" "));
      }
    } catch (error) {
      console.error("Erreur lors du traitement du nom:", error);
    }
  }

  beforeInsert(event: InsertEvent<UsagerTable>) {
    this.processName(event.entity);
  }

  beforeUpdate(event: UpdateEvent<UsagerTable>) {
    if (event.entity) {
      this.processName(event.entity as UsagerTable);
    }
  }
}
