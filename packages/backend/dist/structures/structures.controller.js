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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const structures_service_1 = require("./structures.service");
const structure_dto_1 = require("./structure-dto");
let StructuresController = class StructuresController {
    constructor(structuresService) {
        this.structuresService = structuresService;
    }
    postStructure(structureDto) {
        return this.structuresService.create(structureDto);
    }
    getStructure(id) {
        return this.structuresService.findById(id);
    }
};
__decorate([
    common_1.Post(),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [structure_dto_1.StructureDto]),
    __metadata("design:returntype", void 0)
], StructuresController.prototype, "postStructure", null);
__decorate([
    common_1.Get(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StructuresController.prototype, "getStructure", null);
StructuresController = __decorate([
    common_1.Controller('structures'),
    __metadata("design:paramtypes", [structures_service_1.StructuresService])
], StructuresController);
exports.StructuresController = StructuresController;
//# sourceMappingURL=structures.controller.js.map