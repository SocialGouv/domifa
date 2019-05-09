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
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
class UsagersDto {
}
__decorate([
    class_validator_1.IsIn(['homme', 'femme']),
    __metadata("design:type", String)
], UsagersDto.prototype, "sexe", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], UsagersDto.prototype, "nom", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], UsagersDto.prototype, "prenom", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", Date)
], UsagersDto.prototype, "dateNaissance", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], UsagersDto.prototype, "villeNaissance", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], UsagersDto.prototype, "codePostalNaissance", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsEmail(),
    __metadata("design:type", String)
], UsagersDto.prototype, "email", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], UsagersDto.prototype, "phone", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], UsagersDto.prototype, "etapeDemande", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], UsagersDto.prototype, "statutDemande", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", Object)
], UsagersDto.prototype, "preference", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Object)
], UsagersDto.prototype, "decision", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Array)
], UsagersDto.prototype, "ayantsDroits", void 0);
__decorate([
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], UsagersDto.prototype, "id", void 0);
exports.UsagersDto = UsagersDto;
//# sourceMappingURL=usagers.dto.js.map