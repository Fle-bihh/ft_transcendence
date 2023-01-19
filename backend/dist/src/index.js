"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const channel_entity_1 = require("./entities/channel.entity");
const friend_request_entity_1 = require("./entities/friend-request.entity");
const game_entity_1 = require("./entities/game.entity");
const message_entity_1 = require("./entities/message.entity");
const user_entity_1 = require("./entities/user.entity");
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "database",
    port: 5432,
    username: "postgres",
    password: "root",
    database: "nest",
    entities: [user_entity_1.User, channel_entity_1.Channel, friend_request_entity_1.FriendRequest, game_entity_1.Game, message_entity_1.Message],
    synchronize: true,
    logging: false,
});
AppDataSource.initialize()
    .then(() => {
});
//# sourceMappingURL=index.js.map