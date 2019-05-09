"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const interactions_controller_1 = require("./interactions/interactions.controller");
const structure_module_1 = require("./structures/structure.module");
const structures_controller_1 = require("./structures/structures.controller");
const usagers_controller_1 = require("./usagers/usagers.controller");
const usagers_module_1 = require("./usagers/usagers.module");
const users_controller_1 = require("./users/users.controller");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        controllers: [
            usagers_controller_1.UsagersController,
            users_controller_1.UsersController,
            interactions_controller_1.InteractionsController,
            structures_controller_1.StructuresController,
        ],
        imports: [
            mongoose_1.MongooseModule.forRoot('mongodb://127.0.0.1:27017/domifa'),
            usagers_module_1.UsagersModule,
            users_module_1.UsersModule,
            structure_module_1.StructuresModule,
        ],
        providers: []
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map