"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_schema_1 = require("./user.schema");
exports.UsersProviders = [
    {
        inject: ['DATABASE_CONNECTION'],
        provide: 'USER_MODEL',
        useFactory: (connection) => connection.model('User', user_schema_1.UserSchema),
    }
];
//# sourceMappingURL=users.providers.js.map