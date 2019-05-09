"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const structure_schema_1 = require("./structure.schema");
exports.StructuresProviders = [
    {
        inject: ['DATABASE_CONNECTION'],
        provide: 'STRUCTURE_MODEL',
        useFactory: (connection) => connection.model('Structure', structure_schema_1.StructureSchema),
    },
];
//# sourceMappingURL=structures-providers.js.map