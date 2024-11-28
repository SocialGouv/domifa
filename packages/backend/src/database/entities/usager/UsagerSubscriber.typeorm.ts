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

        const parts = [
          entity.nom,
          entity.prenom,
          entity.surnom,
          entity?.customRef ?? entity?.ref,
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
