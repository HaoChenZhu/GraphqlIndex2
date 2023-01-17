import { Server } from "std/http/server.ts";
import { GraphQLHTTP } from "gql";
import { makeExecutableSchema } from "graphql_tools";
import { typeDefs } from "./schema.ts";
import { Mutation } from "./resolvers/mutation.ts";
import { Query } from "./resolvers/query.ts";
import "dotenv";

const resolvers = {
  Mutation,
  Query
};
let port = Deno.env.get("PORT");
let parsedPort = port ? parseInt(port, 10) : 7777;
const s = new Server({
  handler: async (req) => {
    const { pathname } = new URL(req.url);
    return pathname === "/graphql"
      ? await GraphQLHTTP<Request>({
        schema: makeExecutableSchema({
          resolvers, typeDefs,

        }),
        graphiql: true,
        context: (ctx) => {
          return {
            request: ctx,
            token: ctx.headers.get("token")
          }
        }
      })(req)
      : new Response("Not Found", { status: 404 });
  },
  port: parsedPort,
});

s.listenAndServe();

console.log(`Server running on: http://localhost:${parsedPort}/graphql`);
