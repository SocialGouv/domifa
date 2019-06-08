import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../../users/users.module';
import { UsagersProviders } from '../usagers.providers';
import { CerfaService } from './cerfa.service';
import { UsagersService } from './usagers.service';
import * as fs from 'fs';
import pdftk = require('node-pdftk');
import * as path from 'path';

describe('CerfaService', () => {
  let service: CerfaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ DatabaseModule, UsersModule ],
      providers: [ UsagersService, CerfaService, ...UsagersProviders ],
    }).compile();

    service = module.get<CerfaService>(CerfaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('LOAD PDF FILES', () => {
    const pdfForm1 = '../../ressources/demande.pdf';
    expect(fs.existsSync(path.resolve(__dirname, pdfForm1))).toBe(true);
  });


  it('LOAD PDF FILES', () => {
    const pdfForm2 = '../../ressources/attestation.pdf';
    expect(fs.existsSync(path.resolve(__dirname, pdfForm2))).toBe(true);
  });


  it('should be defined', () => {

    const usager = {
      "ayantsDroits": [],
      "ayantsDroitsExist": false,
      "dateNaissance": new Date("1991-12-12T00:00:00.000Z"),
      "decision": {
        "dateInstruction": new Date("2019-06-05T21:11:37.372Z"),
        "statut": "valide",
        "motif": "",
        "agent": "Domifa Marie",
        "motifDetails": "",
        "orientation": "",
        "orientationDetails": "",
        "dateFin": new Date("2020-06-05T21:13:48.719Z"),
        "dateDebut": new Date("2019-06-05T21:13:48.719Z")
      },
      "email": null,
      "etapeDemande": 6,
      "id": 15,
      "nom": "TESTS",
      "phone": null,
      "preference": {
        "mail": false,
        "phone": false
      },
      "prenom": "TST PRENO",
      "sexe": "homme",
      "structure": "2",
      "villeNaissance": "kqpozkdopqzkd",
      "agent": "Domifa Marie",
      "__v": 0,
      "rdv": {
        "dateRdv": new Date("2019-06-05T21:11:51.373Z"),
        "userId": 2,
        "userName": "Marie Domifa"
      },
      "entretien": {
        "accompagnement": null,
        "accompagnementDetail": null,
        "cause": "causeAutre",
        "causeDetail": "qzdqzdqz",
        "commentaires": null,
        "domiciliation": false,
        "liencommune": null,
        "residence": "residenceAutre",
        "residenceDetail": "qzdqzpoopip",
        "revenus": false
      }
    };

    let pdfForm = '../../ressources/demande.pdf';

    const sexe = usager.sexe === 'femme' ? '1' : '2';
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
    };
    const jourDemande = usager.decision.dateInstruction.getDate().toString();
    const moisDemande = (usager.decision.dateInstruction.getMonth() + 1).toString();
    const anneeDemande = usager.decision.dateInstruction.getFullYear().toString();


    if (usager.decision.statut === 'valide') {
      pdfForm = '../../ressources/attestation.pdf';

      infosPdf["topmostSubform[0].Page1[0].Noms2[0]"] = usager.nom;
      infosPdf["topmostSubform[0].Page1[0].Prénoms2[0]"] = usager.prenom;
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

      infosPdf["topmostSubform[0].Page1[0].EntretienAvec[0]"] = usager.rdv.userName;

      if (usager.decision.statut === 'refus') {
        infosPdf["topmostSubform[0].Page2[0].Décision[0]"] = '2';
        infosPdf["topmostSubform[0].Page2[0].MotifRefus[0]"] = (motifsRefus[usager.decision.motif] || '') + ' : ' +   usager.decision.motifDetails || '';
        infosPdf["topmostSubform[0].Page2[0].OrientationProposée[0]"] = (usager.decision.orientation || '') + ' : ' + (usager.decision.orientationDetails || '');
      }
    }
    return pdftk.input( fs.readFileSync(path.resolve(__dirname, pdfForm))).fillForm(infosPdf).flatten().output();
  });
});
