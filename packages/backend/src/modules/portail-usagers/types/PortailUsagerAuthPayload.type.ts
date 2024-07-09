import { PortailUsagerStructure } from "./PortailUsagerStructure.type";
import { PortailUsagerUsager } from "./PortailUsagerUsager.type";

export type PortailUsagerAuthPayload = {
  structure: PortailUsagerStructure;
  usager: PortailUsagerUsager;
};
