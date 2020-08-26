import { Post } from "./entities/Post";
import { IS_PROD } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  entities: [Post, User],
  dbName: "lireddit",
  user: "jamie",
  type: "postgresql",
  debug: !IS_PROD,
} as Parameters<typeof MikroORM.init>[0];
