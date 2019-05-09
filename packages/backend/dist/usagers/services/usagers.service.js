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
const mongoose_1 = require("mongoose");
let UsagersService = class UsagersService {
    constructor(usagerModel) {
        this.usagerModel = usagerModel;
    }
    create(usagersDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdUsager = new this.usagerModel(usagersDto);
            createdUsager.etapeDemande++;
            createdUsager.dateDemande = new Date();
            createdUsager.id = this.lastId(yield this.findLastUsager());
            return createdUsager.save();
        });
    }
    patch(usagersDto) {
        return __awaiter(this, void 0, void 0, function* () {
            usagersDto.etapeDemande++;
            return this.usagerModel.findOneAndUpdate({
                'id': usagersDto.id
            }, {
                $set: usagersDto
            }, {
                new: true
            }).select('-docsPath').exec();
        });
    }
    setDecision(usagerId, decision) {
        return __awaiter(this, void 0, void 0, function* () {
            decision.dateDebut = new Date();
            decision.userId = 1;
            decision.agent = 'Yassine';
            decision.dateFin = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
            if (decision.statut === 'valide') {
            }
            return this.usagerModel.findOneAndUpdate({
                'id': usagerId
            }, {
                $set: {
                    "etapeDemande": 6,
                    "decision": decision,
                    "statutDemande": decision.statut,
                }
            }, {
                new: true
            }).select('-docsPath').exec();
        });
    }
    setRdv(usagerId, rdvDto) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(rdvDto);
            return this.usagerModel.findOneAndUpdate({
                'id': usagerId
            }, {
                $set: {
                    "dateDemande": new Date().toISOString(),
                    "etapeDemande": 2,
                    "rdv.dateRdv": rdvDto.dateRdv,
                    "rdv.userId": rdvDto.userId,
                    "rdv.username": 'Valérie',
                    "statutDemande": 'entretien',
                }
            }).select('-docsPath').exec();
        });
    }
    deleteDocument(usagerId, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const usager = yield this.usagerModel.findOne({ "id": usagerId }).exec();
            const newDocs = usager.docs;
            const newDocsPath = usager.docsPath;
            newDocs.splice(parseInt(index, 2), 1);
            newDocsPath.splice(parseInt(index, 2), 1);
            return this.usagerModel.findOneAndUpdate({ 'id': usagerId }, {
                $set: {
                    "docs": usager.docs,
                    "docsPath": usager.docsPath
                }
            }, {
                new: true
            }).exec();
        });
    }
    addDocument(usagerId, filename, filetype, label) {
        return __awaiter(this, void 0, void 0, function* () {
            const usager = yield this.usagerModel.findOne({
                "id": usagerId
            }).exec();
            usager.docs.push({
                'createdAt': new Date(),
                'createdBy': 'Yassine',
                'filetype': filetype,
                'label': label,
            });
            usager.docsPath.push(filename);
            return this.usagerModel.findOneAndUpdate({ 'id': usagerId }, {
                $set: {
                    "docs": usager.docs,
                    "docsPath": usager.docsPath
                }
            }, { new: true })
                .select('-docsPath')
                .exec();
        });
    }
    getDocument(usagerId, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const usager = yield this.usagerModel.findOne({
                "id": usagerId
            }).exec();
            const fileInfos = usager.docs[index];
            fileInfos.path = usager.docsPath[index];
            return fileInfos;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usagerModel.find().exec();
        });
    }
    findById(usagerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usagerModel.findOne({
                "id": usagerId
            }).select('-docsPath').exec();
        });
    }
    search(term) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sort = { 'nom': 1 };
            this.searchByName = {
                $or: [
                    {
                        nom: { $regex: '.*' + term + '.*' }
                    },
                    {
                        prenom: { $regex: '.*' + term + '.*' }
                    }
                ]
            };
            const paramsAvailable = ['term', 'statut', 'echeance', 'courrier'];
            return this.usagerModel.find()
                .sort(this.sort)
                .exec();
        });
    }
    findLastUsager() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usagerModel.findOne().select('id').sort({ id: -1 }).limit(1).exec();
        });
    }
    lastId(usager) {
        if (usager) {
            if (usager.id !== undefined) {
                return usager.id + 1;
            }
        }
        return 1;
    }
};
UsagersService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('USAGER_MODEL')),
    __metadata("design:paramtypes", [mongoose_1.Model])
], UsagersService);
exports.UsagersService = UsagersService;
//# sourceMappingURL=usagers.service.js.map