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
    entity.email = entity.email.toLowerCase().trim();
    entity.adresse = entity.adresse.trim();
    entity.nom = entity.nom.trim();
    entity.ville = entity.ville.trim();
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
