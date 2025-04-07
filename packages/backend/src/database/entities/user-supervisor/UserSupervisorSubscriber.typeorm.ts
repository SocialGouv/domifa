import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { UserSupervisorTable } from ".";

@EventSubscriber()
export class UserSupervisorSubscriber
  implements EntitySubscriberInterface<UserSupervisorTable>
{
  listenTo() {
    return UserSupervisorTable;
  }
  public lowerAndTrim(entity: UserSupervisorTable) {
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

  beforeInsert(event: InsertEvent<UserSupervisorTable>) {
    this.lowerAndTrim(event.entity);
  }

  beforeUpdate(event: UpdateEvent<UserSupervisorTable>) {
    if (event.entity) {
      this.lowerAndTrim(event.entity as UserSupervisorTable);
    }
  }
}
