import { DataSource } from "typeorm";
import {Channel} from "./entities/channel.entity";
import {FriendRequest} from "./entities/friend-request.entity";
import {Game} from "./entities/game.entity";
import {Message} from "./entities/message.entity";
import {User} from "./entities/user.entity";

const AppDataSource = new DataSource({
  type: "postgres",
  host: "database",
  port: 5432,
  username: "postgres",
  password: "root",
  database: "nest",
  entities: [User, Channel, FriendRequest, Game, Message],
  synchronize: true,
  logging: false,
  })


  AppDataSource.initialize()
  .then(() => {
  })
