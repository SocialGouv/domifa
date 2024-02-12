import { AyantDroiLienParent } from "@domifa/common";
import { NgbDate } from "@ng-bootstrap/ng-bootstrap";

export interface UsagerFormAyantDroit {
  dateNaissance: NgbDate;
  lien: AyantDroiLienParent;
  nom: string;
  prenom: string;
}
