import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { UserStructureTable } from "./UserStructureTable.typeorm";

@EventSubscriber()
export class StructureSubscriber
  implements EntitySubscriberInterface<UserStructureTable>
{
  listenTo() {
    return UserStructureTable;
  }
  public lowerAndTrim(entity: UserStructureTable) {
    if (entity?.email) {
      entity.email = entity.email.toLowerCase().trim();
    }
    if (entity?.nom) {
      entity.nom = entity.nom.trim();
    }
    if (entity?.prenom) {
      entity.prenom = entity.prenom.trim();
    }
  }

  beforeInsert(event: InsertEvent<UserStructureTable>) {
    this.lowerAndTrim(event.entity);
  }

  beforeUpdate(event: UpdateEvent<UserStructureTable>) {
    if (event.entity) {
      this.lowerAndTrim(event.entity as UserStructureTable);
    }
  }
}
