"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const structures_providers_1 = require("./structures-providers");
const structures_controller_1 = require("./structures.controller");
const structures_service_1 = require("./structures.service");
let StructuresModule = class StructuresModule {
};
StructuresModule = __decorate([
    common_1.Module({
        controllers: [structures_controller_1.StructuresController],
        exports: [structures_service_1.StructuresService],
        imports: [database_module_1.DatabaseModule],
        providers: [structures_service_1.StructuresService, ...structures_providers_1.StructuresProviders],
    })
], StructuresModule);
exports.StructuresModule = StructuresModule;
//# sourceMappingURL=structure.module.js.map