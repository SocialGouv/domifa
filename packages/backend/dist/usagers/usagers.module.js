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
const cerfa_service_1 = require("./services/cerfa.service");
const usagers_service_1 = require("./services/usagers.service");
const usagers_controller_1 = require("./usagers.controller");
const usagers_providers_1 = require("./usagers.providers");
const users_module_1 = require("../users/users.module");
let UsagersModule = class UsagersModule {
};
UsagersModule = __decorate([
    common_1.Module({
        controllers: [usagers_controller_1.UsagersController],
        exports: [usagers_service_1.UsagersService, cerfa_service_1.CerfaService],
        imports: [database_module_1.DatabaseModule, users_module_1.UsersModule],
        providers: [usagers_service_1.UsagersService, cerfa_service_1.CerfaService, ...usagers_providers_1.UsagersProviders],
    })
], UsagersModule);
exports.UsagersModule = UsagersModule;
//# sourceMappingURL=usagers.module.js.map