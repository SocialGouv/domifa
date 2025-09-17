import { CreateUsagerDto } from "../../dto/decision-form/create-usager.dto";

const CREATE_USAGER_DTO = new CreateUsagerDto();
CREATE_USAGER_DTO.nom = "Usager";
CREATE_USAGER_DTO.prenom = "De test";
CREATE_USAGER_DTO.surnom = "Chips";
CREATE_USAGER_DTO.sexe = "homme";
CREATE_USAGER_DTO.dateNaissance = new Date();
CREATE_USAGER_DTO.villeNaissance = "Paris";
CREATE_USAGER_DTO.email = "chips@gmail.com";
CREATE_USAGER_DTO.telephone = {
  countryCode: "fr",
  numero: "",
};

export default CREATE_USAGER_DTO;
