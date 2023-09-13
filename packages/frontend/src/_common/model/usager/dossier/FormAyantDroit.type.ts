import { AyantDroiLienParent } from "@domifa/common";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export type UsagerFormAyantDroit = {
  dateNaissance: NgbDateStruct;
  lien: AyantDroiLienParent;
  nom: string;
  prenom: string;
};
