import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
// import { Post } from "./entities/Post";
import mikroORMConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import connectRedis from "connect-redis";
import session from "express-session";
import { IS_PROD } from "./constants";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(mikroORMConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // protect against csrf
        secure: IS_PROD, // cookie only works in https
      },
      secret: "sdkjgsdjkgnskjngdsdgsdfg",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(">>> Server started on port 4000");
  });
};

main().catch((err) => {
  console.log(err);
});
