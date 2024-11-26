import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { StructureTable } from "./StructureTable.typeorm";

@EventSubscriber()
export class StructureSubscriber
  implements EntitySubscriberInterface<StructureTable>
{
  listenTo() {
    return StructureTable;
  }
  public lowerAndTrim(entity: StructureTable) {
    if (entity?.email) {
      entity.email = entity?.email.toLowerCase().trim();
    }
    if (entity?.adresse) {
      entity.adresse = entity?.adresse.trim();
    }
    if (entity?.nom) {
      entity.nom = entity?.nom.trim();
    }
    if (entity?.ville) {
      entity.ville = entity?.ville.trim();
    }
  }

  beforeInsert(event: InsertEvent<StructureTable>) {
    this.lowerAndTrim(event.entity);
  }

  beforeUpdate(event: UpdateEvent<StructureTable>) {
    if (event.entity) {
      this.lowerAndTrim(event.entity as StructureTable);
    }
  }
}
