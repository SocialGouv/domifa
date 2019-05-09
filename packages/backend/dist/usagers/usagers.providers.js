"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usager_schema_1 = require("./usager.schema");
exports.UsagersProviders = [
    {
        inject: ['DATABASE_CONNECTION'],
        provide: 'USAGER_MODEL',
        useFactory: (connection) => connection.model('Usager', usager_schema_1.UsagerSchema),
    },
];
//# sourceMappingURL=usagers.providers.js.map