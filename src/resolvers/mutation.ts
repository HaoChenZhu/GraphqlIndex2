import { ObjectId } from "mongo";
import { matchCollection, playerCollection, teamCollection, userCollection } from "../mongoDB/db.ts";
import { MatchSchema, PlayerSchema, TeamSchema, UserSchema } from "../mongoDB/schema.ts";
import { createJWT, verifyJWT } from "../lib/jwt.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import "dotenv";
import { MatchStatus, Team, User } from "../type.ts";
interface Context {
    register_key: string;
    token: string
    // lang:string
}
export const Mutation = {
    register: async (
        _: unknown,
        args: {
            username: string;
            email: string;
            password: string;
            name: string;
            surname: string;
        }, ctx: Context
    ): Promise<UserSchema & { token: string }> => {
        try {
            const register_key = ctx.register_key
            if (register_key !== Deno.env.get("REGISTER_KEY")) throw new Error("Clave de registro incorrecto")
            const user: UserSchema | undefined = await userCollection.findOne({
                username: args.username,
            });
            if (user) throw new Error("User already exists");

            const hashedPassword = await bcrypt.hash(args.password);
            const _id = new ObjectId();

            /* const _id :ObjectId = await userCollection.insertOne({
                ...args
            }) */
            const token = await createJWT(
                {
                    username: args.username,
                    email: args.email,
                    name: args.name,
                    surname: args.surname,
                    id: _id.toString(),
                },
                Deno.env.get("JWT_SECRET")!
            );
            const newUser: UserSchema = {
                _id,
                username: args.username,
                email: args.email,
                password: hashedPassword,
                name: args.name,
                surname: args.surname,
            };
            await userCollection.insertOne(newUser);

            return {
                ...newUser,
                token,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    login: async (
        parent: unknown,
        args: {
            username: string;
            password: string;
        }
    ): Promise<string> => {
        try {
            const user: UserSchema | undefined = await userCollection.findOne({
                username: args.username,
            });
            if (!user) {
                throw new Error("User does not exist");
            }
            const validPassword = await bcrypt.compare(args.password, user.password!);
            if (!validPassword) {
                throw new Error("Invalid password");
            }
            const token = await createJWT(
                {
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    surname: user.surname,
                    id: user._id.toString(),
                },
                Deno.env.get("JWT_SECRET")!
            );
            return token;
        } catch (e) {
            throw new Error(e);
        }
    },
    createTeam: async (_: unknown, args: { name: string, players: string[], classified: boolean }, ctx: Context): Promise<TeamSchema> => {
        try {
            const token = ctx.token
            const { name, players, classified } = args;
            if (!token) throw new Error("Acceso denegado")
            const user: User = (await verifyJWT(
                token,
                Deno.env.get("JWT_SECRET")!
            )) as User;
            const existsUser = await userCollection.findOne({ _id: new ObjectId(user.id) });
            if (!existsUser) throw new Error("No existe usuario")
            const existsTeam = await teamCollection.findOne({ name: name });
            if (existsTeam) throw new Error("Este equipo ya existe")
            const team = await teamCollection.insertOne({
                name: name,
                players: players.map((p) => new ObjectId(p)),
                classified: classified,
                updatedBy: new ObjectId(user.id)
            })

            return {
                _id: team,
                name: name,
                players: players.map((p) => new ObjectId(p)),
                classified,
                updatedBy: new ObjectId(user.id)
            }
        } catch (e) {
            throw new Error(e)
        }
    },
    createPlayer: async (_: unknown, args: { name: string }, ctx: Context): Promise<PlayerSchema> => {
        const token = ctx.token
        const { name } = args;
        if (!token) throw new Error("Acceso denegado")
        const user: User = (await verifyJWT(
            token,
            Deno.env.get("JWT_SECRET")!
        )) as User;
        const existsUser = await userCollection.findOne({ _id: new ObjectId(user.id) });
        if (!existsUser) throw new Error("No existe usuario")
        const player = await playerCollection.insertOne({
            name,
            updatedBy: new ObjectId(user.id)
        })
        return {
            _id: player,
            name,
            updatedBy: new ObjectId(user.id)
        }
    },
    updateTeam: async (_: unknown, args: { id: string, players: string[], classified: boolean }, ctx: Context): Promise<TeamSchema> => {
        try {
            const token = ctx.token
            const { id, players, classified } = args;
            if (!token) throw new Error("Acceso denegado")
            const user: User = (await verifyJWT(
                token,
                Deno.env.get("JWT_SECRET")!
            )) as User;
            const existsUser = await userCollection.findOne({ _id: new ObjectId(user.id) });
            if (!existsUser) throw new Error("No existe usuario")
            const teamUpdated = await teamCollection.updateOne({
                _id: new ObjectId(id)
            }, {
                $set: {
                    classified: classified,
                    players: players.map((p) => new ObjectId(p)),
                    updatedBy: new ObjectId(user.id)
                }
            })
            if (teamUpdated.matchedCount === 0) throw new Error("No se ha actualizado")
            return (
                await teamCollection.findOne({
                    _id: new ObjectId(id)
                }) as TeamSchema)

        } catch (e) {
            throw new Error(e);
        }
    },
    deletePlayer: async (_: unknown, args: { id: string }, ctx: Context): Promise<PlayerSchema> => {
        try {
            const token = ctx.token
            const { id } = args;
            if (!token) throw new Error("Acceso denegado")
            const user: User = (await verifyJWT(
                token,
                Deno.env.get("JWT_SECRET")!
            )) as User;
            const existsUser = await userCollection.findOne({ _id: new ObjectId(user.id) });
            if (!existsUser) throw new Error("No existe usuario")
            const player = await playerCollection.findOne({
                _id: new ObjectId(id)
            })
            if (!player) throw new Error("No existe el jugador");
            await playerCollection.deleteOne({
                _id: new ObjectId(id)
            })
            return player;
        } catch (e) {
            throw new Error(e);
        }
    },
    createMatch: async (_: unknown, args: { team1: string, team2: string, goals_team1: number, goals_team2: number, date: Date, status: MatchStatus }, ctx: Context): Promise<MatchSchema> => {
        try {
            const token = ctx.token
            const { team1, team2, goals_team1, goals_team2, status, date } = args;
            if (!token) throw new Error("Acceso denegado")
            const user: User = (await verifyJWT(
                token,
                Deno.env.get("JWT_SECRET")!
            )) as User;
            const existsUser = await userCollection.findOne({ _id: new ObjectId(user.id) });
            if (!existsUser) throw new Error("No existe usuario")
            const existsMatch = await matchCollection.findOne({
                team1: new ObjectId(team1),
                team2: new ObjectId(team2),
                date: date
            })
            if (existsMatch) throw new Error("Ya existe este partido");
            const match = await matchCollection.insertOne({
                team1: new ObjectId(team1),
                team2: new ObjectId(team2),
                goals_team1,
                goals_team2,
                date: date,
                status,
                updatedBy: new ObjectId(user.id)
            })

            return {
                _id: match,
                team1: new ObjectId(team1),
                team2: new ObjectId(team2),
                goals_team1,
                goals_team2,
                date: date,
                status,
                updatedBy: new ObjectId(user.id)
            }

        } catch (e) {
            throw new Error(e);

        }
    },
    updateMatch: async (_: unknown, args: { id: string, goals_team1: number, goals_team2: number, status: MatchStatus }, ctx: Context): Promise<MatchSchema | undefined> => {
        const token = ctx.token
        const { id, goals_team1, goals_team2, status } = args;
        if (!token) throw new Error("Acceso denegado")
        const user: User = (await verifyJWT(
            token,
            Deno.env.get("JWT_SECRET")!
        )) as User;
        const existsUser = await userCollection.findOne({ _id: new ObjectId(user.id) });
        if (!existsUser) throw new Error("No existe usuario")
        const existsMatch = await matchCollection.findOne({
            _id: new ObjectId(id)
        })
        if (!existsMatch) throw new Error("No existe este partido");
        const match = await matchCollection.updateOne({
            _id: new ObjectId(id)
        }, {
            $set: {
                goals_team1,
                goals_team2,
                status,
                updatedBy: new ObjectId(user.id)
            }
        })
        if (match.matchedCount === 0) throw new Error("No se midifico nada");
        return (await matchCollection.findOne({ _id: new ObjectId(id) }))
    },
    deleteMatch: async (_: unknown, args: { id: string }, ctx: Context): Promise<MatchSchema> => {
        const token = ctx.token
        const { id } = args;
        if (!token) throw new Error("Acceso denegado")
        const user: User = (await verifyJWT(
            token,
            Deno.env.get("JWT_SECRET")!
        )) as User;
        const existsUser = await userCollection.findOne({ _id: new ObjectId(user.id) });
        if (!existsUser) throw new Error("No existe usuario")
        const existsMatch = await matchCollection.findOne({
            _id: new ObjectId(id)
        })
        if (!existsMatch) throw new Error("No existe este partido");
        await matchCollection.deleteOne({
            _id: new ObjectId(id)
        })
        return existsMatch;

    }

}