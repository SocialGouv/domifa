import { Inject, Injectable, Logger, Res } from '@nestjs/common';
import * as fs from 'fs';
import { Model } from "mongoose";
import pdftk = require('node-pdftk');
import * as path from 'path';
import { UsersService } from '../../users/users.service';
import { Usager } from '../interfaces/usagers';


@Injectable()
export class CerfaService {
  private readonly logger = new Logger(CerfaService.name);

  constructor(@Inject('USAGER_MODEL') private readonly usagerModel: Model<Usager>, private readonly usersService: UsersService) {

  }

  public async attestation(usager: Usager) {
    const user = await this.usersService.findById(2);
    let pdfForm = '../../ressources/demande.pdf';

    const sexe = usager.sexe === 'femme' ? '1' : '2';
    const today = new Date();
    const motifsRefus = {
      "refus1": "Existence d'un hébergement stable",
      "refus2": "Nombre de domiciliations de votre organisme prévu par l’agrément atteint (associations)",
      "refus3": "En dehors des critères du public domicilié (associations)",
      "refus4": "Absence de lien avec la commune (CCAS/commune)",
      "refusAutre": "Autre (précisez le motif)",
    };


    let ayantsDroitsTexte = '';
    for (const ayantDroit of usager.ayantsDroits) { 
      const dateNaissaceTmp = usager.dateNaissance.getDate() + '/' + (usager.dateNaissance.getMonth() + 1) + '/' + usager.dateNaissance.getFullYear();
      ayantsDroitsTexte = ayantsDroitsTexte + ayantDroit.nom + ' ' + ayantDroit.prenom + ' ' + ayantDroit.dateNaissance + ' né(e) le ' + dateNaissaceTmp + '\t\t ';
    }

    const infosPdf = {
      "topmostSubform[0].Page1[0].AyantsDroits[0]": ayantsDroitsTexte || '',
      "topmostSubform[0].Page1[0].Datenaissance1[0]": usager.dateNaissance.getDate().toString(),
      "topmostSubform[0].Page1[0].Datenaissance2[0]": (usager.dateNaissance.getMonth() + 1).toString(),
      "topmostSubform[0].Page1[0].Datenaissance3[0]": usager.dateNaissance.getFullYear().toString(),
      "topmostSubform[0].Page1[0].LieuNaissance[0]": usager.villeNaissance.toString(),
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": sexe,
      "topmostSubform[0].Page1[0].Noms[0]": usager.nom.toUpperCase(),
      "topmostSubform[0].Page1[0].Prénoms[0]": usager.prenom.toUpperCase(),
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]" : user.structure.nom,
      "topmostSubform[0].Page2[0].NuméroAgrément[0]" : user.structure.agrement,
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]" : user.structure.departement,
    };
    const jourDemande = usager.decision.dateInstruction.getDate().toString();
    const moisDemande = (usager.decision.dateInstruction.getMonth() + 1).toString();
    const anneeDemande = usager.decision.dateInstruction.getFullYear().toString();

    const adresseStructure = user.structure.adresse + ', ' + user.structure.complementAdresse + ', ' + user.structure.ville + ', ' + user.structure.codePostal;

    if (usager.decision.statut === 'valide') {
      pdfForm = '../../ressources/attestation.pdf';

      infosPdf["topmostSubform[0].Page1[0].Nomdelorganisme[0]"] = user.structure.nom;
      infosPdf["topmostSubform[0].Page1[0].RespOrganisme[0]"] = user.structure.responsable.nom + ' ' + user.structure.responsable.prenom;
      infosPdf["topmostSubform[0].Page1[0].PréfectureayantDélivré[0]"] = user.structure.departement;
      infosPdf["topmostSubform[0].Page1[0].NumAgrement[0]"] = user.structure.agrement;
      infosPdf["topmostSubform[0].Page1[0].AdressePostaleOrganisme[0]"] = user.structure.adresse + ' ' + user.structure.ville + ' ' +  user.structure.codePostal;
      infosPdf["topmostSubform[0].Page1[0].Courriel[0]"] = user.structure.mail;
      infosPdf["topmostSubform[0].Page1[0].téléphone[0]"] = user.structure.phone;
      infosPdf["topmostSubform[0].Page1[0].Noms2[0]"] = usager.nom;
      infosPdf["topmostSubform[0].Page1[0].Prénoms2[0]"] = usager.prenom;
      infosPdf["topmostSubform[0].Page1[0].AdressePostale[0]"] = user.structure.agrement + ', ' + user.structure.ville + ' ' +  user.structure.codePostal;
    }
    else {
      infosPdf["topmostSubform[0].Page1[0].téléphone[0]"] = usager.phone || '';
      infosPdf["topmostSubform[0].Page1[0].Courriel[0]"] = usager.email || '';
      infosPdf["topmostSubform[0].Page1[0].Groupe_de_boutons_radio[0]"] = '1';
      infosPdf["topmostSubform[0].Page1[0].LieuNaissance[1]"] = usager.villeNaissance.toString()  || '';
      infosPdf["topmostSubform[0].Page2[0].Mme-Monsieur2[0]"] = sexe;
      infosPdf["topmostSubform[0].Page2[0].NomsDemandeur[0]"] = usager.nom.toUpperCase() ;
      infosPdf["topmostSubform[0].Page2[0].PrénomsDemandeur[0]"] = usager.prenom.toUpperCase();
      infosPdf["topmostSubform[0].Page2[0].JourNaissanceDemandeur[0]"] = usager.dateNaissance.getDate().toString();
      infosPdf["topmostSubform[0].Page2[0].MoisNaissanceDemandeur[0]"] = (usager.dateNaissance.getMonth() + 1).toString();
      infosPdf["topmostSubform[0].Page2[0].AnnéeNaissanceDemandeur[0]"] = usager.dateNaissance.getFullYear().toString();
      infosPdf["topmostSubform[0].Page2[0].LieuNaissanceDemandeur[0]"] = usager.villeNaissance.toString().toUpperCase();

      /* FAIT LE */
      infosPdf["topmostSubform[0].Page1[0].FaitLeOrganisme1[0]"] = jourDemande;
      infosPdf["topmostSubform[0].Page1[0].FaitLeOrganisme2[0]"] = moisDemande;
      infosPdf["topmostSubform[0].Page1[0].FaitLeOrganisme3[0]"] = anneeDemande;
      infosPdf["topmostSubform[0].Page1[0].FaitLeDemandeur1[0]"] = jourDemande;
      infosPdf["topmostSubform[0].Page1[0].FaitLeDemandeur2[0]"] = moisDemande;
      infosPdf["topmostSubform[0].Page1[0].FaitLeDemandeur3[0]"] = anneeDemande;

      infosPdf["topmostSubform[0].Page1[0].Jourconvocation[0]"] = usager.rdv.dateRdv.getDate().toString();
      infosPdf["topmostSubform[0].Page1[0].Moisconvocation[0]"] = (usager.rdv.dateRdv.getMonth() + 1).toString();
      infosPdf["topmostSubform[0].Page1[0].Annéeconvocation[0]"] = usager.rdv.dateRdv.getFullYear().toString();

      infosPdf["topmostSubform[0].Page1[0].Heureconvocation[0]"] = usager.rdv.dateRdv.getHours().toString();
      infosPdf["topmostSubform[0].Page1[0].Minuteconvocation[0]"] = usager.rdv.dateRdv.getMinutes().toString();

      infosPdf["topmostSubform[0].Page1[0].Nomdelorganisme[0]"] = user.structure.nom;
      infosPdf["topmostSubform[0].Page1[0].PréfectureayantDélivré[0]"] = user.structure.departement;
      infosPdf["topmostSubform[0].Page1[0].NumAgrement[0]"] = user.structure.agrement;

      infosPdf["topmostSubform[0].Page1[0].AdressePostale[0]"] = adresseStructure ;
      infosPdf["topmostSubform[0].Page1[0].Courriel[1]"] = user.structure.mail;
      infosPdf["topmostSubform[0].Page1[0].téléphone[1]"] = user.structure.phone;

      infosPdf["topmostSubform[0].Page1[0].EntretienAvec[0]"] = usager.rdv.userName;
      infosPdf["topmostSubform[0].Page1[0].EntretienAdresse[0]"] = adresseStructure;

      if (usager.decision.statut === 'refus') {
        infosPdf["topmostSubform[0].Page2[0].Décision[0]"] = '2';
        infosPdf["topmostSubform[0].Page2[0].MotifRefus[0]"] = (motifsRefus[usager.decision.motif] || '') + ' : ' +   usager.decision.motifDetails || '';
        infosPdf["topmostSubform[0].Page2[0].OrientationProposée[0]"] = (usager.decision.orientation || '') + ' : ' + (usager.decision.orientationDetails || '');
      }
    }
    this.logger.log(path.resolve(__dirname, pdfForm));
    this.logger.log(typeof infosPdf);
    return pdftk.input( fs.readFileSync(path.resolve(__dirname, pdfForm))).fillForm(infosPdf).flatten().output();
  }


}
