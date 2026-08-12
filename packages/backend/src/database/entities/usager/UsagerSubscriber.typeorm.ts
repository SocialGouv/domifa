import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";
import { computeUsagerSearchIndex } from "./computeUsagerSearchIndex";

// Champs qui alimentent l'index de recherche. Le subscriber ne voit que le
// payload (`repository.update()` ne charge pas la ligne) : recalculer depuis
// un payload où l'un d'eux MANQUE produirait un index tronqué — un dossier
// introuvable par le nom de son mandataire, par exemple.
const SEARCH_INDEX_FIELDS = [
  "nom",
  "prenom",
  "surnom",
  "customRef",
  "ayantsDroits",
  "options",
] as const;

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

    entity.nom = entity.nom.trim();
    entity.prenom = entity.prenom.trim();
    entity.nom_prenom_surnom_ref = computeUsagerSearchIndex(entity);
  }

  beforeInsert(event: InsertEvent<UsagerTable>) {
    if (event.entity) {
      this.processName(event.entity);
    }
  }

  beforeUpdate(event: UpdateEvent<UsagerTable>) {
    const entity = event.entity as UsagerTable | undefined;
    if (!entity) {
      return;
    }

    // Le chemin d'écriture a déjà calculé l'index (via
    // `computeUsagerSearchIndex` sur l'entité complète) : ne pas l'écraser
    // avec un recalcul depuis un payload possiblement partiel.
    if (typeof entity.nom_prenom_surnom_ref !== "undefined") {
      return;
    }

    // Payload partiel : mieux vaut un index momentanément périmé qu'un index
    // tronqué. Un chemin qui modifie un champ indexé doit fournir soit les
    // six champs, soit `nom_prenom_surnom_ref` calculé.
    const isComplete = SEARCH_INDEX_FIELDS.every(
      (field) => typeof entity[field] !== "undefined"
    );
    if (!isComplete) {
      return;
    }

    this.processName(entity);
  }
}
