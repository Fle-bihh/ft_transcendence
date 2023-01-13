"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    type: "postgres",
    host: "localhost",
    port: 5001,
    username: "postgres",
    password: "password",
    database: "chat_app",
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    cli: {
        migrationsDir: "src/migration"
    }
};
exports.default = config;
//# sourceMappingURL=typeorm.config.js.map