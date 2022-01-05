import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { AyantDroiLienParent } from "..";

export type UsagerFormAyantDroit = {
  dateNaissance: NgbDateStruct;
  lien: AyantDroiLienParent;
  nom: string;
  prenom: string;
};
