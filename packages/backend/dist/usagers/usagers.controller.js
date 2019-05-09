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
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = require("path");
const rdv_1 = require("./dto/rdv");
const usagers_dto_1 = require("./dto/usagers.dto");
const cerfa_service_1 = require("./services/cerfa.service");
const usagers_service_1 = require("./services/usagers.service");
let UsagersController = class UsagersController {
    constructor(usagersService, cerfaService) {
        this.usagersService = usagersService;
        this.cerfaService = cerfaService;
    }
    postUsager(usagerDto) {
        return this.usagersService.create(usagerDto);
    }
    patchUsager(usagerDto) {
        return this.usagersService.patch(usagerDto);
    }
    postRdv(usagerId, rdvDto) {
        return this.usagersService.setRdv(usagerId, rdvDto);
    }
    setDecision(usagerId, decision) {
        return this.usagersService.setDecision(usagerId, decision);
    }
    search() {
        return this.usagersService.search();
    }
    findOne(usagerId) {
        return this.usagersService.findById(usagerId);
    }
    getAttestation(usagerId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const usager = yield this.usagersService.findById(usagerId);
            this.cerfaService.attestation(usager)
                .then(buffer => {
                res.send(buffer);
            })
                .catch(err => {
                console.log(err);
            });
        });
    }
    deleteDocument(usagerId, index) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usagersService.deleteDocument(usagerId, index);
        });
    }
    getDocument(usagerId, index, res) {
        return __awaiter(this, void 0, void 0, function* () {
            this.usagersService.getDocument(usagerId, index)
                .then(fileInfos => {
                const pathFile = path.resolve(__dirname, '../uploads/' + fileInfos.path);
                res.sendFile(path.join(__dirname, '../uploads/' + fileInfos.path));
            })
                .catch(err => {
                console.log(err);
            });
        });
    }
    uploadDoc(usagerId, file, postData) {
        return this.usagersService.addDocument(usagerId, file.filename, file.mimetype, postData.label);
    }
};
__decorate([
    common_1.Post(),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usagers_dto_1.UsagersDto]),
    __metadata("design:returntype", void 0)
], UsagersController.prototype, "postUsager", null);
__decorate([
    common_1.Patch(),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usagers_dto_1.UsagersDto]),
    __metadata("design:returntype", void 0)
], UsagersController.prototype, "patchUsager", null);
__decorate([
    common_1.Post('rdv/:id'),
    __param(0, common_1.Param('id')), __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, rdv_1.RdvDto]),
    __metadata("design:returntype", void 0)
], UsagersController.prototype, "postRdv", null);
__decorate([
    common_1.Post('decision/:id'),
    __param(0, common_1.Param('id')), __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UsagersController.prototype, "setDecision", null);
__decorate([
    common_1.Get('search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsagersController.prototype, "search", null);
__decorate([
    common_1.Get(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsagersController.prototype, "findOne", null);
__decorate([
    common_1.Get('attestation/:id'),
    common_1.Header('Content-Type', 'application/pdf'),
    __param(0, common_1.Param('id')), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsagersController.prototype, "getAttestation", null);
__decorate([
    common_1.Delete('document/:usagerId/:index'),
    __param(0, common_1.Param('usagerId')), __param(1, common_1.Param('index')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UsagersController.prototype, "deleteDocument", null);
__decorate([
    common_1.Get('document/:usagerId/:index'),
    __param(0, common_1.Param('usagerId')), __param(1, common_1.Param('index')), __param(2, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], UsagersController.prototype, "getDocument", null);
__decorate([
    common_1.Post('document/:usagerId'),
    common_1.UseInterceptors(platform_express_1.FileInterceptor('file', {
        storage: multer_1.diskStorage({
            destination: 'src/uploads',
            fileFilter: (req, file, cb) => {
                const mimeTest = !file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/);
                const sizeTest = file.size >= 5242880;
                if (sizeTest || mimeTest) {
                    throw new common_1.BadRequestException({
                        fileSize: sizeTest,
                        fileType: mimeTest
                    });
                }
                cb(null, true);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${path.extname(file.originalname)}`);
            },
        }),
    })),
    __param(0, common_1.Param('usagerId')), __param(1, common_1.UploadedFile()), __param(2, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], UsagersController.prototype, "uploadDoc", null);
UsagersController = __decorate([
    common_1.Controller('usagers'),
    __metadata("design:paramtypes", [usagers_service_1.UsagersService,
        cerfa_service_1.CerfaService])
], UsagersController);
exports.UsagersController = UsagersController;
//# sourceMappingURL=usagers.controller.js.map