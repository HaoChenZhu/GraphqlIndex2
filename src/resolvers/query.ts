import { verifyJWT } from "../lib/jwt.ts";
import { matchCollection, playerCollection, teamCollection } from "../mongoDB/db.ts";
import { Player, User } from "../type.ts";
import { ObjectId } from "mongo";
import { MatchSchema, PlayerSchema, TeamSchema } from "../mongoDB/schema.ts";

interface Context {
    token: string
    // lang:string
}
export const Query = {
    Me: async (parent: unknown, args: unknown, ctx: Context) => {
        try {
            const token = ctx.token
            if (token) {
                const user: User = (await verifyJWT(
                    token,
                    Deno.env.get("JWT_SECRET")!
                )) as User;
                return user;
            }
        } catch (e) {
            throw new Error(e);
        }
    },
    hello: () => "Hello World!",
    team: async (_: unknown, args: { id: string }): Promise<TeamSchema> => {
        try {
            const { id } = args
            const team = await teamCollection.findOne({
                _id: new ObjectId(id)
            })
            if (!team) throw new Error("No existe este equipo")
            return team
        } catch (e) {
            throw new Error(e)
        }
    },
    teams: async (_: unknown, args: unknown): Promise<TeamSchema[]> => {
        try {
            const teams = await teamCollection.find().toArray();
            return teams
        } catch (e) {
            throw new Error(e);

        }
    },
    player: async (_: unknown, args: { id: string }): Promise<PlayerSchema> => {
        try {
            const { id } = args
            const player = await playerCollection.findOne({
                _id: new ObjectId(id)
            })
            if (!player) throw new Error("No existe jugador");
            return player;
        } catch (e) {
            throw new Error(e);

        }
    },
    players: async (): Promise<PlayerSchema[]> => {
        try {
            const players = await playerCollection.find().toArray()
            return players
        } catch (e) {
            throw new Error(e);

        }
    },
    match: async (_: unknown, args: { id: string }): Promise<MatchSchema> => {
        const { id } = args
        try {
            const match = await matchCollection.findOne({
                _id: new ObjectId(id)
            })
            if (!match) throw new Error("No existe este partido");
            return match

        } catch (e) {
            throw new Error(e);

        }
    },
    matches: async (): Promise<MatchSchema[]> => {
        try {
            const match = await matchCollection.find().toArray()
            if (!match) throw new Error("No existe este partido");
            return match

        } catch (e) {
            throw new Error(e);

        }
    },
};

