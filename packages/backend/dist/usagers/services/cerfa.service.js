"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const fs = require("fs");
const mongoose_1 = require("mongoose");
const path = require("path");
const pdftk = require("node-pdftk");
const users_service_1 = require("../../users/users.service");
let CerfaService = class CerfaService {
    constructor(usagerModel, usersService) {
        this.usagerModel = usagerModel;
        this.usersService = usersService;
    }
    attestation(usager) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersService.findById(2);
            let pdfForm = './demande.pdf';
            const sexe = usager.sexe === 'femme' ? '1' : '2';
            const today = new Date();
            console.log(user);
            let ayantsDroitsTexte = '';
            for (const ayantDroit of usager.ayantsDroits) {
                const dateNaissaceTmp = usager.dateNaissance.getDate() + '/' + (usager.dateNaissance.getMonth() + 1) + '/' + usager.dateNaissance.getFullYear();
                ayantsDroitsTexte = ayantsDroitsTexte + ayantDroit.nom + ' ' + ayantDroit.prenom + ' ' + ayantDroit.dateNaissance + ' né(e) le ' + dateNaissaceTmp + '\t\t ';
            }
            const infosPdf = {
                'topmostSubform[0].Page1[0].Mme-Monsieur1[0]': sexe,
                'topmostSubform[0].Page1[0].Noms[0]': usager.nom.toUpperCase(),
                'topmostSubform[0].Page1[0].Prénoms[0]': usager.prenom.toUpperCase(),
                'topmostSubform[0].Page1[0].Datenaissance1[0]': usager.dateNaissance.getDate().toString(),
                'topmostSubform[0].Page1[0].Datenaissance2[0]': (usager.dateNaissance.getMonth() + 1).toString(),
                'topmostSubform[0].Page1[0].Datenaissance3[0]': usager.dateNaissance.getFullYear().toString(),
                'topmostSubform[0].Page1[0].LieuNaissance[0]': usager.villeNaissance.toString(),
                'topmostSubform[0].Page1[0].AyantsDroits[0]': ayantsDroitsTexte,
            };
            const jourDemande = usager.dateDemande.getDate().toString();
            const moisDemande = (usager.dateDemande.getMonth() + 1).toString();
            const anneeDemande = usager.dateDemande.getFullYear().toString();
            if (usager.statutDemande === 'valide') {
                pdfForm = './attestation.pdf';
                infosPdf["topmostSubform[0].Page1[0].Nomdelorganisme[0]"] = user.structure.nom;
                infosPdf["topmostSubform[0].Page1[0].RespOrganisme[0]"] = user.structure.responsable.nom + ' ' + user.structure.responsable.prenom;
                infosPdf["topmostSubform[0].Page1[0].PréfectureayantDélivré[0]"] = user.structure.departement;
                infosPdf["topmostSubform[0].Page1[0].NumAgrement[0]"] = user.structure.agrement;
                infosPdf["topmostSubform[0].Page1[0].AdressePostaleOrganisme[0]"] = user.structure.agrement + ', ' + user.structure.ville + ' ' + user.structure.codePostal;
                infosPdf["topmostSubform[0].Page1[0].Courriel[0]"] = user.structure.mail;
                infosPdf["topmostSubform[0].Page1[0].téléphone[0]"] = user.structure.phone;
                infosPdf["topmostSubform[0].Page1[0].Noms2[0]"] = usager.nom;
                infosPdf["topmostSubform[0].Page1[0].Prénoms2[0]"] = usager.prenom;
                infosPdf["topmostSubform[0].Page1[0].AdressePostale[0]"] = user.structure.agrement + ', ' + user.structure.ville + ' ' + user.structure.codePostal;
                infosPdf["topmostSubform[0].Page1[0].JourValidité1[0]"] = usager.decision.dateDebut.getDate().toString();
                infosPdf["topmostSubform[0].Page1[0].MoisValidité1[0]"] = (usager.decision.dateDebut.getMonth() + 1).toString();
                infosPdf["topmostSubform[0].Page1[0].AnnéeValidité1[0]"] = usager.decision.dateDebut.getFullYear().toString();
                infosPdf["topmostSubform[0].Page1[0].JourValidité2[0]"] = usager.decision.dateFin.getDate().toString();
                infosPdf["topmostSubform[0].Page1[0].MoisValidité2[0]"] = (usager.decision.dateFin.getMonth() + 1).toString();
                infosPdf["topmostSubform[0].Page1[0].AnnéeValidité2[0]"] = usager.decision.dateFin.getFullYear().toString();
                infosPdf["topmostSubform[0].Page1[0].JourPremiereDomic[0]"] = usager.decision.dateDebut.getDate().toString();
                infosPdf["topmostSubform[0].Page1[0].MoisPremiereDomic[0]"] = (usager.decision.dateDebut.getMonth() + 1).toString();
                infosPdf["topmostSubform[0].Page1[0].AnneePremiereDomic[0]"] = usager.decision.dateDebut.getFullYear().toString();
                infosPdf["topmostSubform[0].Page1[0].Faità[0]"] = user.structure.ville;
                infosPdf["topmostSubform[0].Page1[0].FaitleJour[0]"] = today.getDate().toString();
                infosPdf["topmostSubform[0].Page1[0].FaitleMois[0]"] = (today.getMonth() + 1).toString();
                infosPdf["topmostSubform[0].Page1[0].FaitleAnnée[0]"] = today.getFullYear().toString().substr(-2);
            }
            else {
                infosPdf['topmostSubform[0].Page1[0].téléphone[0]'] = usager.phone;
                infosPdf['topmostSubform[0].Page1[0].Courriel[0]'] = usager.email;
                infosPdf['topmostSubform[0].Page1[0].Groupe_de_boutons_radio[0]'] = '1';
                infosPdf['topmostSubform[0].Page1[0].LieuNaissance[1]'] = usager.villeNaissance.toString();
                infosPdf['topmostSubform[0].Page2[0].Mme-Monsieur2[0]'] = sexe;
                infosPdf['topmostSubform[0].Page2[0].NomsDemandeur[0]'] = usager.nom.toUpperCase();
                infosPdf['topmostSubform[0].Page2[0].PrénomsDemandeur[0]'] = usager.prenom.toUpperCase();
                infosPdf['topmostSubform[0].Page2[0].JourNaissanceDemandeur[0]'] = usager.dateNaissance.getDate().toString();
                infosPdf['topmostSubform[0].Page2[0].MoisNaissanceDemandeur[0]'] = (usager.dateNaissance.getMonth() + 1).toString();
                infosPdf['topmostSubform[0].Page2[0].AnnéeNaissanceDemandeur[0]'] = usager.dateNaissance.getFullYear().toString();
                infosPdf['topmostSubform[0].Page2[0].LieuNaissanceDemandeur[0]'] = usager.villeNaissance.toString().toUpperCase();
                infosPdf['topmostSubform[0].Page1[0].FaitLeOrganisme1[0]'] = jourDemande;
                infosPdf['topmostSubform[0].Page1[0].FaitLeOrganisme2[0]'] = moisDemande;
                infosPdf['topmostSubform[0].Page1[0].FaitLeOrganisme3[0]'] = anneeDemande;
                infosPdf['topmostSubform[0].Page1[0].FaitLeDemandeur1[0]'] = jourDemande;
                infosPdf['topmostSubform[0].Page1[0].FaitLeDemandeur2[0]'] = moisDemande;
                infosPdf['topmostSubform[0].Page1[0].FaitLeDemandeur3[0]'] = anneeDemande;
                infosPdf['topmostSubform[0].Page1[0].Jourconvocation[0]'] = usager.rdv.dateRdv.getDate().toString();
                infosPdf['topmostSubform[0].Page1[0].Moisconvocation[0]'] = (usager.rdv.dateRdv.getMonth() + 1).toString();
                infosPdf['topmostSubform[0].Page1[0].Annéeconvocation[0]'] = usager.rdv.dateRdv.getFullYear().toString();
                infosPdf['topmostSubform[0].Page1[0].Heureconvocation[0]'] = usager.rdv.dateRdv.getHours().toString();
                infosPdf['topmostSubform[0].Page1[0].Minuteconvocation[0]'] = usager.rdv.dateRdv.getMinutes().toString();
                infosPdf['topmostSubform[0].Page1[0].EntretienAvec[0]'] = usager.rdv.userName.toString();
                if (usager.statutDemande === 'refus') {
                    infosPdf['topmostSubform[0].Page2[0].MotifRefus[0]'] = "REFUS";
                }
            }
            return pdftk.input(fs.readFileSync(path.resolve(__dirname, pdfForm))).fillForm(infosPdf).flatten().output();
        });
    }
};
CerfaService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('USAGER_MODEL')),
    __metadata("design:paramtypes", [mongoose_1.Model, users_service_1.UsersService])
], CerfaService);
exports.CerfaService = CerfaService;
//# sourceMappingURL=cerfa.service.js.map